import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class SystemPromptBuilder {
  private workspaceDir: string;

  constructor(workspaceDir: string) {
    this.workspaceDir = workspaceDir;
  }

  public buildPrompt(): string {
    // 1. Load Identity (SOUL.md)
    // Priority: Workspace -> Project Root -> Default
    const soul = this.loadContent('SOUL.md') || 'You are a helpful AI assistant.';

    // 2. Load Agents/Rules (AGENTS.md)
    const agents = this.loadContent('AGENTS.md') || '';
    
    // 3. Load Long-Term Memory (MEMORY.md) - Workspace Only
    const memory = this.loadMemory();

    // 4. Runtime Info
    const runtimeInfo = this.getRuntimeInfo();

    return `
${soul}

${agents}

${memory}

## Runtime Context
${runtimeInfo}
    `.trim();
  }

  private loadContent(filename: string): string | null {
    // Try workspace first
    let filePath = path.join(this.workspaceDir, filename);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }

    // Try project root (CWD) fallback - helpful for first run before seeding
    filePath = path.join(process.cwd(), filename);
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
    }

    return null;
  }

  private loadMemory(): string {
    const memoryPath = path.join(this.workspaceDir, 'MEMORY.md');
    if (fs.existsSync(memoryPath)) {
      try {
        const content = fs.readFileSync(memoryPath, 'utf8');
        return `\n\n## Long-Term Memory (MEMORY.md)\n${content}`;
      } catch (err) {
        // Ignore read errors
      }
    }
    return '';
  }

  private getRuntimeInfo(): string {
    const now = new Date();
    return `
- Date: ${now.toISOString().split('T')[0]}
- Time: ${now.toTimeString().split(' ')[0]}
- OS: ${os.type()} ${os.release()}
- Workspace: ${this.workspaceDir}
    `.trim();
  }
}
