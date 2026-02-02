import express from 'express';
import http from 'http';
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

const execAsync = promisify(exec);
const scheduler = new Scheduler();
const processManager = new ProcessManager();

// --- Express & HTTP Setup ---
const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json()); // Enable JSON body parsing
// Serve static files (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, 'web/public')));

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

const router = new ModelRouter();
const skillLoader = new SkillLoader(path.join(__dirname, 'skills'));
const skillsPrompt = skillLoader.loadSkills(); // Assuming sync or async handled

const SYSTEM_PROMPT = `You are an Agentic AI assistant.
You have access to 'exec' and 'bash'.
Don't make assumptions.

${skillsPrompt}`;

// --- Session Management ---
interface Session {
    history: any[];
}
const sessions = new Map<string, Session>();
const connectionMap = new Map<WebSocket, string>();

// Scheduler Trigger
scheduler.on('trigger', (task) => {
    const alertMsg = JSON.stringify({ type: 'system', content: `⏰ REMINDER: ${task.content}` });
    const session = sessions.get("main");
    if (session) session.history.push({ role: 'system', content: `[System Event] ${task.content}` });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(alertMsg);
    });
});

wss.on('connection', (ws) => {
    console.log("🔌 New connection established");
    const sessionKey = "main";
    let session = sessions.get(sessionKey);
    
    if (!session) {
        session = { history: [{ role: 'system', content: SYSTEM_PROMPT }] };
        sessions.set(sessionKey, session);
    } else {
        const lastMsg = session.history[session.history.length - 1];
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
        const session = sessions.get(sessionKey)!;
        session.history.push({ role: 'user', content: text });
        session.history = limitHistory(session.history, MAX_HISTORY_TURNS);

        try {
            await processTurn(ws, session);
        } catch (error: any) {
            ws.send(JSON.stringify({ type: 'system', content: `Error: ${error.message}` }));
        }
    });

    ws.on('close', () => connectionMap.delete(ws));
});

async function processTurn(ws: WebSocket, session: Session) {
    const responseMsg = await router.chat(session.history, toolsDefinition);
    session.history.push(responseMsg);

    if (responseMsg.tool_calls && responseMsg.tool_calls.length > 0) {
        for (const toolCall of responseMsg.tool_calls) {
            const fnName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            const result = await runTool(fnName, args);
            session.history.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                name: fnName,
                content: result
            });
        }
        await processTurn(ws, session);
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
});
