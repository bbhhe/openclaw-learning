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

  it('should return base prompt unchanged if MEMORY.md is missing', () => {
    const base = 'You are a bot.';
    const result = promptBuilder.buildPrompt(base);
    expect(result).toBe(base);
  });

  it('should append MEMORY.md content if it exists', () => {
    const base = 'You are a bot.';
    const memoryContent = '- User likes pizza.';
    
    fs.writeFileSync(path.join(tempDir, 'MEMORY.md'), memoryContent, 'utf8');
    
    const result = promptBuilder.buildPrompt(base);
    
    expect(result).toContain(base);
    expect(result).toContain('## Long-Term Memory (MEMORY.md)');
    expect(result).toContain(memoryContent);
  });
});
