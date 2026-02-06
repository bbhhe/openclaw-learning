import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Manages sandboxed environments for different courses.
 * Ensures each course has its own directory to avoid file conflicts.
 */
export class SandboxManager {
  private rootPath: string;

  constructor(rootPath: string = 'workspace/sandboxes') {
    this.rootPath = path.resolve(rootPath);
    if (!fs.existsSync(this.rootPath)) {
      fs.mkdirSync(this.rootPath, { recursive: true });
    }
  }

  /**
   * Gets the absolute path to a course's sandbox.
   * Creates the directory if it doesn't exist.
   * @param courseId The unique identifier for the course.
   * @returns The absolute path to the course's sandbox directory.
   */
  public getSandboxPath(courseId: string): string {
    const sandboxPath = path.join(this.rootPath, courseId);
    if (!fs.existsSync(sandboxPath)) {
      fs.mkdirSync(sandboxPath, { recursive: true });
    }
    return sandboxPath;
  }
}
