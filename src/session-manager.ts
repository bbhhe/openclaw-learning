import * as fs from 'fs';
import * as path from 'path';

export class SessionManager {
  private storageDir: string;

  constructor(storageDir: string) {
    this.storageDir = storageDir;
    this.ensureStorageDir();
  }

  private ensureStorageDir() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  private getSessionFilePath(sessionId: string): string {
    // Sanitize sessionId to prevent directory traversal
    const sanitizedId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.storageDir, `${sanitizedId}.jsonl`);
  }

  async appendMessage(sessionId: string, message: any): Promise<void> {
    const filePath = this.getSessionFilePath(sessionId);
    const line = JSON.stringify(message) + '\n';
    await fs.promises.appendFile(filePath, line, 'utf8');
  }

  async saveSession(sessionId: string, messages: any[]): Promise<void> {
    const filePath = this.getSessionFilePath(sessionId);
    const content = messages.map(m => JSON.stringify(m)).join('\n') + '\n';
    await fs.promises.writeFile(filePath, content, 'utf8');
  }

  async loadSession(sessionId: string): Promise<any[]> {
    const filePath = this.getSessionFilePath(sessionId);
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = await fs.promises.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    const messages: any[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        messages.push(JSON.parse(line));
      } catch (error) {
        console.warn(`Failed to parse session line for ${sessionId}: ${line}`, error);
        // Continue despite error (corrupt line handling)
      }
    }

    return messages;
  }
}
