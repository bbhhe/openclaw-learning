import fs from 'fs';
import path from 'path';

export class SessionManager {
    private sessionsDir: string;

    constructor(workspacePath: string) {
        this.sessionsDir = path.join(workspacePath, 'sessions');
        this.ensureSessionsDir();
    }

    private ensureSessionsDir() {
        if (!fs.existsSync(this.sessionsDir)) {
            try {
                fs.mkdirSync(this.sessionsDir, { recursive: true });
                console.log(`[SessionManager] Created sessions directory at: ${this.sessionsDir}`);
            } catch (err) {
                console.error(`[SessionManager] Failed to create sessions directory:`, err);
            }
        }
    }

    getFilePath(sessionId: string): string {
        // Sanitize sessionId to prevent directory traversal
        const safeId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '_');
        return path.join(this.sessionsDir, `${safeId}.jsonl`);
    }

    loadSession(sessionId: string): any[] {
        const filePath = this.getFilePath(sessionId);
        if (!fs.existsSync(filePath)) {
            return [];
        }

        const history: any[] = [];
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const lines = fileContent.split('\n');
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                
                try {
                    const message = JSON.parse(trimmed);
                    history.push(message);
                } catch (parseErr) {
                    console.warn(`[SessionManager] Skipping invalid JSON line in session ${sessionId}: ${trimmed.substring(0, 50)}...`);
                }
            }
        } catch (err) {
            console.error(`[SessionManager] Error loading session ${sessionId}:`, err);
        }

        return history;
    }

    appendMessage(sessionId: string, message: any) {
        const filePath = this.getFilePath(sessionId);
        try {
            const line = JSON.stringify(message) + '\n';
            fs.appendFileSync(filePath, line, 'utf-8');
        } catch (err) {
            console.error(`[SessionManager] Failed to append message to session ${sessionId}:`, err);
        }
    }

    saveSession(sessionId: string, history: any[]) {
        const filePath = this.getFilePath(sessionId);
        try {
            // Rewrite the entire file
            const content = history.map(msg => JSON.stringify(msg)).join('\n') + '\n';
            fs.writeFileSync(filePath, content, 'utf-8');
        } catch (err) {
            console.error(`[SessionManager] Failed to save session ${sessionId}:`, err);
        }
    }
}
