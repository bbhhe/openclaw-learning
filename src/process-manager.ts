import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import os from 'os';

interface Session {
    id: string;
    process: ChildProcess;
    buffer: string;
    createdAt: number;
}

export class ProcessManager extends EventEmitter {
    private sessions = new Map<string, Session>();

    constructor() {
        super();
    }

    start(command: string, cwd: string = process.cwd()): string {
        const id = Math.random().toString(36).substring(7);
        const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
        
        // Use spawn to allow streaming
        const child = spawn(shell, ['-c', command], {
            cwd: cwd,
            env: process.env,
            stdio: ['pipe', 'pipe', 'pipe'] // Allow stdin/stdout/stderr interaction
        });

        const session: Session = {
            id,
            process: child,
            buffer: '',
            createdAt: Date.now()
        };

        const append = (data: string) => {
            session.buffer += data;
            // Trim buffer
            if (session.buffer.length > 100 * 1024) {
                session.buffer = session.buffer.slice(-50 * 1024);
            }
        };

        if (child.stdout) {
            child.stdout.on('data', (data) => append(data.toString()));
        }
        if (child.stderr) {
            child.stderr.on('data', (data) => append(data.toString()));
        }

        child.on('close', (code) => {
            console.log(`[ProcessManager] Session ${id} exited with code ${code}`);
            append(`\n[Process exited with code ${code}]`);
        });

        this.sessions.set(id, session);
        console.log(`[ProcessManager] Started session ${id}: ${command}`);
        return id;
    }

    getLog(id: string): string {
        const session = this.sessions.get(id);
        return session ? session.buffer : "Session not found";
    }

    write(id: string, data: string): boolean {
        const session = this.sessions.get(id);
        if (!session || !session.process.stdin) return false;
        session.process.stdin.write(data);
        return true;
    }

    kill(id: string) {
        const session = this.sessions.get(id);
        if (session) {
            session.process.kill();
            this.sessions.delete(id);
        }
    }

    list() {
        return Array.from(this.sessions.values()).map(s => ({
            id: s.id,
            pid: s.process.pid,
            age: Math.round((Date.now() - s.createdAt) / 1000) + 's'
        }));
    }
}
