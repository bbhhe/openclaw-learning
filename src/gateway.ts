import { WebSocketServer, WebSocket } from 'ws';
import { ModelRouter } from './router';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { SkillLoader } from './skill-loader';
import { limitHistory } from './utils';
import { MAX_HISTORY_TURNS } from './config';
import { Scheduler } from './scheduler'; // Import Scheduler

const execAsync = promisify(exec);
const scheduler = new Scheduler(); // Initialize Scheduler

// 1. 定义工具箱
const toolsDefinition = [
    {
        type: "function",
        function: {
            name: "exec",
            description: "Execute a shell command on the host system. Use this to check system status, read files, or run scripts.",
            parameters: {
                type: "object",
                properties: {
                    command: {
                        type: "string",
                        description: "The shell command to run (e.g., 'ls -la', 'cat file.txt', 'curl wttr.in')"
                    }
                },
                required: ["command"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "schedule_reminder",
            description: "Schedule a reminder or system event for the future.",
            parameters: {
                type: "object",
                properties: {
                    content: {
                        type: "string",
                        description: "The text content of the reminder."
                    },
                    delaySeconds: {
                        type: "number",
                        description: "How many seconds from now to trigger the reminder."
                    }
                },
                required: ["content", "delaySeconds"]
            }
        }
    }
];

// 2. 实现工具逻辑
async function runTool(name: string, args: any): Promise<string> {
    if (name === 'exec') {
        console.log(`🛠️ Executing: ${args.command}`);
        try {
            const { stdout, stderr } = await execAsync(args.command);
            return stdout || stderr || "(No output)";
        } catch (error: any) {
            return `Error: ${error.message}`;
        }
    }
    if (name === 'schedule_reminder') {
        const id = scheduler.addTask(args.content, args.delaySeconds);
        return `✅ Reminder scheduled! ID: ${id}, Content: "${args.content}" in ${args.delaySeconds}s.`;
    }
    return "Unknown tool";
}

const wss = new WebSocketServer({ port: 8080 });
const router = new ModelRouter();

// 加载技能
const skillLoader = new SkillLoader(path.join(__dirname, 'skills'));
const skillsPrompt = skillLoader.loadSkills();

const SYSTEM_PROMPT = `You are an Agentic AI assistant.
You have access to a Linux shell via the 'exec' tool.
You can schedule reminders using 'schedule_reminder'.
Don't make assumptions. If you need info, use 'exec' to find it.

${skillsPrompt}`;

console.log("🚀 Gateway (With Cron & Main Session) is listening on ws://localhost:8080");

interface Session {
    history: { role: string, content?: string, tool_calls?: any[], tool_call_id?: string, name?: string }[];
}

const sessions = new Map<string, Session>(); // Key 是 SessionID (例如 "main")
const connectionMap = new Map<WebSocket, string>(); // 记录 WS 属于哪个 Session

// === Scheduler Event Listener ===
scheduler.on('trigger', (task) => {
    // 闹钟响了！通知所有连接到 "main" 的客户端
    const alertMsg = `⏰ SYSTEM REMINDER: ${task.content}`;
    console.log(alertMsg);

    // 找到 Main Session 并注入历史记录 (System Event)
    const session = sessions.get("main");
    if (session) {
        session.history.push({ role: 'system', content: `[System Event] ${task.content}` });
    }

    // 广播给所有活跃连接
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(alertMsg);
        }
    });
});

wss.on('connection', (ws) => {
    console.log("🔌 New connection established");
    
    // === 核心修改：实现 Main Session 模式 ===
    // 假设所有连接都路由到同一个 "main" Session
    const sessionKey = "main"; 
    
    let session = sessions.get(sessionKey);
    
    if (!session) {
        console.log(`✨ Creating new Main Session: ${sessionKey}`);
        session = { 
            history: [
                { role: 'system', content: SYSTEM_PROMPT }
            ] 
        };
        sessions.set(sessionKey, session);
    } else {
        console.log(`♻️  Resuming existing Main Session: ${sessionKey} (${session.history.length} msgs)`);
        // 可选：给重连的用户发最后一条消息，帮他回忆上下文
        const lastMsg = session.history[session.history.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
            ws.send(`[Resumed] AI: ${lastMsg.content}`);
        }
    }

    // 绑定连接
    connectionMap.set(ws, sessionKey);

    ws.on('message', async (rawMessage) => {
        const text = rawMessage.toString();
        console.log(`👂 Received: ${text}`);
        
        // 从 Map 中找 Session，而不是直接用 ws
        const key = connectionMap.get(ws)!;
        const session = sessions.get(key)!;
        
        session.history.push({ role: 'user', content: text });

        // 核心：在处理之前，先修剪历史记录
        // 保持 System Prompt 不动，修剪中间的 User/Assistant 消息
        const beforeLen = session.history.length;
        session.history = limitHistory(session.history, MAX_HISTORY_TURNS);
        const afterLen = session.history.length;

        if (beforeLen > afterLen) {
            console.log(`✂️ History trimmed: ${beforeLen} -> ${afterLen} messages (Max Turns: ${MAX_HISTORY_TURNS})`);
        }

        try {
            await processTurn(ws, session);
        } catch (error: any) {
            console.error("💥 Processing failed:", error.message);
            ws.send(`System Error: ${error.message}`);
        }
    });

    ws.on('close', () => {
        // 连接断开，但不删除 Session！实现了“掉线不失忆”
        connectionMap.delete(ws);
        console.log("🔌 Disconnected (Session persisted)");
    });
});

// 3. 核心循环：思考 -> 行动 -> 观察 -> 思考
async function processTurn(ws: WebSocket, session: Session) {
    const responseMsg = await router.chat(session.history, toolsDefinition);
    session.history.push(responseMsg);

    if (responseMsg.tool_calls && responseMsg.tool_calls.length > 0) {
        console.log("🤖 AI wants to use tools...");
        
        for (const toolCall of responseMsg.tool_calls) {
            const fnName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            
            const result = await runTool(fnName, args);
            console.log(`🔍 Tool Result: ${result.slice(0, 50)}...`);

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
        console.log(`🧠 AI Says: ${responseMsg.content}`);
        ws.send(`AI: ${responseMsg.content}`);
    }
}
