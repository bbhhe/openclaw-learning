import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { SystemPromptBuilder } from './system-prompt';
import * as fs from 'fs';
import * as path from 'path';

vi.mock('fs');

describe('SystemPromptBuilder', () => {
  const mockWorkspacePath = '/mock/workspace';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('should build prompt with default fallback when files are missing', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const builder = new SystemPromptBuilder(mockWorkspacePath);
    const prompt = builder.buildPrompt();

    expect(prompt).toContain('You are a helpful AI assistant.'); // Default SOUL
    expect(prompt).toContain('## Runtime Context');
  });

  it('should include content from SOUL.md and AGENTS.md', () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pStr = p.toString();
      return pStr.endsWith('SOUL.md') || pStr.endsWith('AGENTS.md');
    });

    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      const pStr = p.toString();
      if (pStr.endsWith('SOUL.md')) return 'Custom Soul Content';
      if (pStr.endsWith('AGENTS.md')) return 'Agent Rules Here';
      return '';
    });

    const builder = new SystemPromptBuilder(mockWorkspacePath);
    const prompt = builder.buildPrompt();

    expect(prompt).toContain('Custom Soul Content');
    expect(prompt).toContain('Agent Rules Here');
  });

  it('should include correct runtime info', () => {
    // Mock Date
    const mockDate = new Date('2023-10-10T12:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    const builder = new SystemPromptBuilder(mockWorkspacePath);
    const prompt = builder.buildPrompt();

    expect(prompt).toContain('Date: 2023-10-10');
    // Note: Time might vary based on timezone in test env, but we can check structure
    expect(prompt).toContain(`Workspace: ${mockWorkspacePath}`);
  });
});
