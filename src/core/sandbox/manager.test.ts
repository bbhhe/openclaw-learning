import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { SandboxManager } from './manager.js';

vi.mock('node:fs');

describe('SandboxManager', () => {
  const rootPath = 'workspace/test_sandboxes';
  const resolvedRootPath = path.resolve(rootPath);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize and create root path if it does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    
    new SandboxManager(rootPath);
    
    expect(fs.existsSync).toHaveBeenCalledWith(resolvedRootPath);
    expect(fs.mkdirSync).toHaveBeenCalledWith(resolvedRootPath, { recursive: true });
  });

  it('should return and create course sandbox path', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true); // Root exists
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
        if (p === resolvedRootPath) return true;
        return false; // course path does not exist
    });

    const manager = new SandboxManager(rootPath);
    const courseId = 'course-123';
    const expectedPath = path.join(resolvedRootPath, courseId);
    
    const result = manager.getSandboxPath(courseId);
    
    expect(result).toBe(expectedPath);
    expect(fs.mkdirSync).toHaveBeenCalledWith(expectedPath, { recursive: true });
  });

  it('should return existing course sandbox path without creating it', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    
    const manager = new SandboxManager(rootPath);
    const courseId = 'course-123';
    const expectedPath = path.join(resolvedRootPath, courseId);
    
    const result = manager.getSandboxPath(courseId);
    
    expect(result).toBe(expectedPath);
    // Should be called once for root in constructor, and once for courseId in getSandboxPath
    expect(fs.mkdirSync).not.toHaveBeenCalledWith(expectedPath, { recursive: true });
  });
});
