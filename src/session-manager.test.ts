import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SessionManager } from './session-manager';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('SessionManager', () => {
  let tempDir: string;
  let sessionManager: SessionManager;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'session-test-'));
    sessionManager = new SessionManager(tempDir);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should initialize and ensure storage directory exists', () => {
    expect(fs.existsSync(tempDir)).toBe(true);
  });

  it('should append messages to a session file', async () => {
    const sessionId = 'test-session';
    const message = { role: 'user', content: 'hello' };
    
    await sessionManager.appendMessage(sessionId, message);
    
    const filePath = path.join(tempDir, 'test-session.jsonl');
    expect(fs.existsSync(filePath)).toBe(true);
    
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain(JSON.stringify(message));
  });

  it('should load session history correctly', async () => {
    const sessionId = 'history-session';
    const messages = [
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'hello there' }
    ];

    for (const msg of messages) {
      await sessionManager.appendMessage(sessionId, msg);
    }

    const loaded = await sessionManager.loadSession(sessionId);
    expect(loaded).toHaveLength(2);
    expect(loaded).toEqual(messages);
  });

  it('should save session by overwriting existing content', async () => {
    const sessionId = 'overwrite-session';
    const initialMsg = { role: 'user', content: 'initial' };
    await sessionManager.appendMessage(sessionId, initialMsg);

    const newHistory = [
      { role: 'user', content: 'new start' },
      { role: 'assistant', content: 'new response' }
    ];

    await sessionManager.saveSession(sessionId, newHistory);
    
    const loaded = await sessionManager.loadSession(sessionId);
    expect(loaded).toHaveLength(2);
    expect(loaded).toEqual(newHistory);
  });

  it('should handle corrupt JSON lines gracefully', async () => {
    const sessionId = 'corrupt-session';
    const filePath = path.join(tempDir, 'corrupt-session.jsonl');
    
    const content = '{"role":"user","content":"valid"}\nCORRUPT_DATA\n{"role":"assistant","content":"valid2"}\n';
    fs.writeFileSync(filePath, content, 'utf8');

    const loaded = await sessionManager.loadSession(sessionId);
    
    expect(loaded).toHaveLength(2);
    expect(loaded[0].content).toBe('valid');
    expect(loaded[1].content).toBe('valid2');
  });

  it('should return empty array if session does not exist', async () => {
    const loaded = await sessionManager.loadSession('non-existent');
    expect(loaded).toEqual([]);
  });
});
