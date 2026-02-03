import express from 'express';
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { exec } from 'child_process';
import { promisify } from 'util';

import { ModelRouter } from './router';
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

// --- Configuration & Workspace Resolution ---
// Logic: Default to ~/.openclaw-learning. Only use process.cwd()/workspace if OPENCLAW_DEV=true
let workspacePath: string;
if (process.env.OPENCLAW_DEV === 'true') {
    workspacePath = path.join(process.cwd(), 'workspace');
} else {
    workspacePath = path.join(os.homedir(), '.openclaw-learning');
}

// Ensure workspace exists
if (!fs.existsSync(workspacePath)) {
    try {
        fs.mkdirSync(workspacePath, { recursive: true });
        console.log(`[Init] Created workspace: ${workspacePath}`);
    } catch (e) {
        console.error(`[Init] Failed to create workspace: ${e}`);
        process.exit(1);
    }
}

console.log(`[Init] Using workspace: ${workspacePath}`);

// Initialize Components
const configLoader = new ConfigLoader(workspacePath);
const config = configLoader.getConfig();

const sessionManager = new SessionManager(workspacePath); // Will look in workspace/sessions
const systemPromptBuilder = new SystemPromptBuilder(workspacePath);

// Initialize SkillLoader (Dual Source)
const internalSkills = path.join(__dirname, 'skills');
const externalSkills = path.join(workspacePath, 'skills');
const skillLoader = new SkillLoader([internalSkills, externalSkills]);
const skillsPrompt = skillLoader.loadSkills();

// Ensure Identity Files Exist (Seed from Repo if missing)
function seedIdentityFiles() {
    const files = ['SOUL.md', 'AGENTS.md'];
    for (const file of files) {
        const dest = path.join(workspacePath, file);
        if (!fs.existsSync(dest)) {
            // Try to copy from current working dir (Repo root)
            const src = path.join(process.cwd(), file);
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
                console.log(`[Init] Seeded ${file} to workspace.`);
            }
        }
    }
}
seedIdentityFiles();

const router = new ModelRouter(configLoader);

// --- Express & HTTP Setup ---
const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT || "31004", 10);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'web/public')));

app.get('/health', (req, res) => {
    res.send('OpenClaw Learning Gateway is running! 🚀');
});

// --- WebSocket Setup ---
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

// --- Session Logic ---
function getFullSystemPrompt(): string {
    const basePrompt = systemPromptBuilder.buildPrompt();
    return `${basePrompt}\n\n## Tools & Skills\n${skillsPrompt}`;
}

// Scheduler Trigger
scheduler.on('trigger', (task) => {
    const alertMsg = JSON.stringify({ type: 'system', content: `⏰ REMINDER: ${task.content}` });
    const systemMsg = { role: 'system', content: `[System Event] ${task.content}` };
    
    // Persist to main session
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
    
    // Refresh System Prompt
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
        sessionManager.saveSession(sessionKey, history);
        
        // Resume context
        const lastMsg = history[history.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
            ws.send(JSON.stringify({ type: 'message', content: `[Resumed]: ${lastMsg.content}` }));
        }
    }

    ws.on('message', async (rawMessage) => {
        let text = rawMessage.toString();
        try {
            const json = JSON.parse(text);
            if (json.type === 'message') text = json.content;
        } catch (e) {}

        console.log(`👂 User: ${text}`);
        
        const userMsg = { role: 'user', content: text };
        sessionManager.appendMessage(sessionKey, userMsg);
        history.push(userMsg);
        history = limitHistory(history, MAX_HISTORY_TURNS);

        try {
            await processTurn(ws, sessionKey, history);
        } catch (error: any) {
            ws.send(JSON.stringify({ type: 'system', content: `Error: ${error.message}` }));
        }
    });
});

async function processTurn(ws: WebSocket, sessionKey: string, history: any[]) {
    const responseMsg = await router.chat(history, toolsDefinition);
    
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
            
            sessionManager.appendMessage(sessionKey, toolMsg);
            history.push(toolMsg);
        }
        await processTurn(ws, sessionKey, history);
        return;
    }

    if (responseMsg.content) {
        ws.send(JSON.stringify({ type: 'message', content: responseMsg.content }));
    }
}

server.listen(PORT, () => {
    console.log(`🚀 Gateway running on http://localhost:${PORT}`);
    console.log(`📂 Workspace: ${workspacePath}`);
});
