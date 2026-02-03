import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SystemPromptBuilder } from './system-prompt';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('SystemPromptBuilder', () => {
  let tempDir: string;
  let promptBuilder: SystemPromptBuilder;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-test-'));
    promptBuilder = new SystemPromptBuilder(tempDir);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should include SOUL.md content', () => {
    const soulContent = 'You are the soul of the bot.';
    fs.writeFileSync(path.join(tempDir, 'SOUL.md'), soulContent, 'utf8');

    const result = promptBuilder.buildPrompt();
    expect(result).toContain(soulContent);
    expect(result).toContain('Runtime Context');
  });

  it('should include AGENTS.md content if it exists', () => {
    const soulContent = 'Base Soul';
    fs.writeFileSync(path.join(tempDir, 'SOUL.md'), soulContent, 'utf8');

    const agentsContent = 'Agents rules here.';
    fs.writeFileSync(path.join(tempDir, 'AGENTS.md'), agentsContent, 'utf8');

    const result = promptBuilder.buildPrompt();
    expect(result).toContain(agentsContent);
  });

  it('should include MEMORY.md content if it exists', () => {
    const soulContent = 'Base Soul';
    fs.writeFileSync(path.join(tempDir, 'SOUL.md'), soulContent, 'utf8');

    const memoryContent = '- User likes pizza.';
    fs.writeFileSync(path.join(tempDir, 'MEMORY.md'), memoryContent, 'utf8');
    
    const result = promptBuilder.buildPrompt();
    
    expect(result).toContain('## Long-Term Memory (MEMORY.md)');
    expect(result).toContain(memoryContent);
  });
});
