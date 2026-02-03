import express from 'express';
import http from 'http';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { ModelRouter } from './router';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { SkillLoader } from './skill-loader';
import { limitHistory } from './utils';
import { MAX_HISTORY_TURNS } from './config';
import { Scheduler } from './scheduler';
import { ProcessManager } from './process-manager';
import { ConfigLoader } from './config-loader';
import { SystemPromptBuilder } from './system-prompt';
import { SessionManager } from './session-manager';

const execAsync = promisify(exec);
const scheduler = new Scheduler();
const processManager = new ProcessManager();

// --- Configuration & System Prompt ---
// Initialize ConfigLoader
// Priority: Custom Env Var -> Local Workspace -> Home Directory
const localWorkspace = path.join(process.cwd(), 'workspace');
const homeWorkspace = path.join(process.env.HOME || process.cwd(), '.openclaw-learning');
const workspacePath = fs.existsSync(localWorkspace) ? localWorkspace : homeWorkspace;

console.log(`[Init] Using workspace: ${workspacePath}`);

const configLoader = new ConfigLoader(workspacePath);
const config = configLoader.getConfig();

// Initialize SystemPromptBuilder
const systemPromptBuilder = new SystemPromptBuilder(config.workspacePath);
const sessionManager = new SessionManager(config.workspacePath);

// --- Express & HTTP Setup ---
const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT || "31004", 10);

app.use(express.json()); // Enable JSON body parsing

// Serve static files (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, 'web/public')));

// --- Health Check ---
app.get('/health', (req, res) => {
    res.send('OpenClaw Learning Gateway is running! 🚀');
});

// --- SSE Endpoint ---
app.post('/api/chat/sse', async (req, res) => {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "messages array required" });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        // Assume 'router' is globally available or we get it here
        // For tools, we currently don't support tools in SSE simple mode yet, or we can pass toolsDefinition
        // But streaming tools is complex (need to buffer tool calls). 
        // For this MVP, let's start with pure text streaming (no tools).
        for await (const chunk of router.chatStream(messages)) {
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
    } catch (error: any) {
        console.error("SSE Error:", error);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    } finally {
        res.end();
    }
});

// --- WebSocket Setup ---
// Bind WS to the HTTP server
const wss = new WebSocketServer({ server });

// --- Tool Definitions ---
const toolsDefinition = [
    {
        type: "function",
        function: {
            name: "exec",
            description: "Execute a simple shell command (non-interactive).",
            parameters: {
                type: "object",
                properties: { command: { type: "string" } },
                required: ["command"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "bash",
            description: "Start a background shell session.",
            parameters: {
                type: "object",
                properties: {
                    command: { type: "string" },
                    workdir: { type: "string" }
                },
                required: ["command"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "process",
            description: "Manage background processes.",
            parameters: {
                type: "object",
                properties: {
                    action: { type: "string", enum: ["log", "write", "kill", "list"] },
                    sessionId: { type: "string" },
                    data: { type: "string" }
                },
                required: ["action"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "schedule_reminder",
            description: "Schedule a reminder.",
            parameters: {
                type: "object",
                properties: {
                    content: { type: "string" },
                    delaySeconds: { type: "number" }
                },
                required: ["content", "delaySeconds"]
            }
        }
    }
];

async function runTool(name: string, args: any): Promise<string> {
    if (name === 'exec') {
        try {
            const { stdout, stderr } = await execAsync(args.command);
            return stdout || stderr || "(No output)";
        } catch (error: any) {
            return `Error: ${error.message}`;
        }
    }
    if (name === 'bash') {
        const id = processManager.start(args.command, args.workdir);
        return `✅ Started background session. ID: ${id}`;
    }
    if (name === 'process') {
        if (args.action === 'list') return JSON.stringify(processManager.list());
        if (!args.sessionId) return "Error: sessionId required";
        if (args.action === 'log') return processManager.getLog(args.sessionId) || "(Empty)";
        if (args.action === 'write') return processManager.write(args.sessionId, args.data || "") ? "Written." : "Failed.";
        if (args.action === 'kill') { processManager.kill(args.sessionId); return "Killed."; }
    }
    if (name === 'schedule_reminder') {
        const id = scheduler.addTask(args.content, args.delaySeconds);
        return `✅ Reminder scheduled! ID: ${id}`;
    }
    return "Unknown tool";
}

const router = new ModelRouter(configLoader);
const skillLoader = new SkillLoader(path.join(__dirname, 'skills'));
const skillsPrompt = skillLoader.loadSkills();

// Combine dynamic system prompt with skills
// We will generate the base prompt dynamically now
function getFullSystemPrompt(): string {
    const basePrompt = systemPromptBuilder.buildPrompt();
    return `${basePrompt}\n\n## Tools & Skills\n${skillsPrompt}`;
}

// --- Session Management ---
// interface Session {
//     history: any[];
// }
// const sessions = new Map<string, Session>();
const connectionMap = new Map<WebSocket, string>();

// Scheduler Trigger
scheduler.on('trigger', (task) => {
    const alertMsg = JSON.stringify({ type: 'system', content: `⏰ REMINDER: ${task.content}` });
    
    // Append to "main" session history on disk
    const systemMsg = { role: 'system', content: `[System Event] ${task.content}` };
    sessionManager.appendMessage("main", systemMsg);

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(alertMsg);
    });
});

wss.on('connection', (ws) => {
    console.log("🔌 New connection established");
    const sessionKey = "main";
    
    // Load history from disk
    let history = sessionManager.loadSession(sessionKey);
    
    // Always refresh system prompt on new connection (or start of session) to capture file changes
    const currentSystemPrompt = getFullSystemPrompt();
    const systemMsg = { role: 'system', content: currentSystemPrompt };

    if (history.length === 0) {
        history.push(systemMsg);
        sessionManager.saveSession(sessionKey, history);
    } else {
        // Ensure system prompt is fresh and at index 0
        if (history[0].role !== 'system') {
            history.unshift(systemMsg);
        } else {
            history[0].content = currentSystemPrompt;
        }
        // Save the updated system prompt to disk
        sessionManager.saveSession(sessionKey, history);
        
        const lastMsg = history[history.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
            ws.send(JSON.stringify({ type: 'message', content: `[Resumed]: ${lastMsg.content}` }));
        }
    }
    connectionMap.set(ws, sessionKey);

    ws.on('message', async (rawMessage) => {
        let text = rawMessage.toString();
        // Handle JSON if client sends structured data
        try {
            const json = JSON.parse(text);
            if (json.type === 'message') text = json.content;
        } catch (e) {
            // Plain text fallback
        }

        console.log(`👂 User: ${text}`);
        
        // Reload history to ensure we have the latest state (if multiple clients were writing)
        // For simplicity in this single-node MVP, we can rely on the in-memory array for the duration of this turn,
        // but it's safer to re-load or keep an in-memory cache. 
        // For this implementation: we load, append user msg, then process.
        
        // Re-load is safer but slower. Let's optimize: use the local 'history' variable for this connection scope?
        // No, 'history' variable is local to the connection closure. If we want persistence across restarts,
        // we should treat the disk (or SessionManager) as the source of truth.
        // Let's just append the user message to disk immediately.
        
        const userMsg = { role: 'user', content: text };
        sessionManager.appendMessage(sessionKey, userMsg);
        
        // Update local history array for processing
        history.push(userMsg);
        history = limitHistory(history, MAX_HISTORY_TURNS);

        try {
            // We pass 'history' by reference-ish, but processTurn needs to know how to append the Assistant response.
            // We'll modify processTurn to use sessionManager or return the response.
            await processTurn(ws, sessionKey, history);
        } catch (error: any) {
            ws.send(JSON.stringify({ type: 'system', content: `Error: ${error.message}` }));
        }
    });

    ws.on('close', () => connectionMap.delete(ws));
});

async function processTurn(ws: WebSocket, sessionKey: string, history: any[]) {
    const responseMsg = await router.chat(history, toolsDefinition);
    
    // Append assistant response to disk & memory
    sessionManager.appendMessage(sessionKey, responseMsg);
    history.push(responseMsg);

    if (responseMsg.tool_calls && responseMsg.tool_calls.length > 0) {
        for (const toolCall of responseMsg.tool_calls) {
            const fnName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            const result = await runTool(fnName, args);
            
            const toolMsg = {
                role: 'tool',
                tool_call_id: toolCall.id,
                name: fnName,
                content: result
            };
            
            // Append tool result to disk & memory
            sessionManager.appendMessage(sessionKey, toolMsg);
            history.push(toolMsg);
        }
        // Recursively process the next turn (model sees tool output)
        await processTurn(ws, sessionKey, history);
        return;
    }

    if (responseMsg.content) {
        ws.send(JSON.stringify({ type: 'message', content: responseMsg.content }));
    }
}

// Start Server
server.listen(PORT, () => {
    console.log(`🚀 Gateway running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
    console.log(`📂 Workspace: ${config.workspacePath}`);
    const defaultModel = config.models && config.models.length > 0 ? config.models[0] : { modelName: 'Unknown', provider: 'Unknown' };
    console.log(`🤖 Model: ${defaultModel.modelName} (${defaultModel.provider})`);
});
