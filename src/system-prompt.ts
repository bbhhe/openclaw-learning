import * as fs from 'fs';
import * as path from 'path';

export class SystemPromptBuilder {
  private workspaceDir: string;

  constructor(workspaceDir: string) {
    this.workspaceDir = workspaceDir;
  }

  buildPrompt(basePrompt: string): string {
    const memoryPath = path.join(this.workspaceDir, 'MEMORY.md');
    
    let memoryContent = '';
    if (fs.existsSync(memoryPath)) {
      try {
        const content = fs.readFileSync(memoryPath, 'utf8');
        memoryContent = `\n\n## Long-Term Memory (MEMORY.md)\n${content}`;
      } catch (err) {
        console.warn('Failed to read MEMORY.md', err);
      }
    }

    return `${basePrompt}${memoryContent}`;
  }
}
