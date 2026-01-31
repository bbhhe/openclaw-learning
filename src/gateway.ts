import { WebSocketServer, WebSocket } from 'ws';
import { ModelRouter } from './router';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { SkillLoader } from './skill-loader';

const execAsync = promisify(exec);

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
    return "Unknown tool";
}

const wss = new WebSocketServer({ port: 8080 });
const router = new ModelRouter();

// 加载技能
const skillLoader = new SkillLoader(path.join(__dirname, 'skills'));
const skillsPrompt = skillLoader.loadSkills();

const SYSTEM_PROMPT = `You are an Agentic AI assistant.
You have access to a Linux shell via the 'exec' tool.
Don't make assumptions. If you need info, use 'exec' to find it.

${skillsPrompt}`;

console.log("🚀 Gateway (With Skills!) is listening on ws://localhost:8080");

interface Session {
    history: { role: string, content?: string, tool_calls?: any[], tool_call_id?: string, name?: string }[];
}

const sessions = new Map<WebSocket, Session>();

wss.on('connection', (ws) => {
    console.log("🔌 New connection established");
    
    // 初始化带 System Prompt 的记忆
    sessions.set(ws, { 
        history: [
            { role: 'system', content: SYSTEM_PROMPT }
        ] 
    });

    ws.on('message', async (rawMessage) => {
        const text = rawMessage.toString();
        console.log(`👂 Received: ${text}`);
        
        const session = sessions.get(ws)!;
        session.history.push({ role: 'user', content: text });

        try {
            await processTurn(ws, session);
        } catch (error: any) {
            console.error("💥 Processing failed:", error.message);
            ws.send(`System Error: ${error.message}`);
        }
    });

    ws.on('close', () => sessions.delete(ws));
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
