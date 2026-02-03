import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class SystemPromptBuilder {
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
  }

  public buildPrompt(): string {
    const soul = this.readFile('SOUL.md') || 'You are a helpful AI assistant.';
    const agents = this.readFile('AGENTS.md') || '';
    
    const memoryContent = this.readFile('MEMORY.md', true);
    const memorySection = memoryContent ? `\n\n## Memory\n${memoryContent}` : '';

    // Runtime information
    const runtimeInfo = this.getRuntimeInfo();

    return `
${soul}

${agents}${memorySection}

## Runtime Context
${runtimeInfo}
    `.trim();
  }

  private readFile(filename: string, silent: boolean = false): string | null {
    const filePath = path.join(this.workspacePath, filename);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    if (!silent) {
      console.warn(`[SystemPrompt] Warning: File not found: ${filePath}`);
    }
    return null;
  }

  private getRuntimeInfo(): string {
    const now = new Date();
    return `
- Date: ${now.toISOString().split('T')[0]}
- Time: ${now.toTimeString().split(' ')[0]}
- OS: ${os.type()} ${os.release()}
- Workspace: ${this.workspacePath}
    `.trim();
  }
}
