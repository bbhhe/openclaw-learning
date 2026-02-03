import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SystemPromptBuilder } from './system-prompt';
import { SessionManager } from './session-manager';
import { SkillLoader } from './skill-loader';

// Mock ConfigLoader since it was not found in the file list
export class ConfigLoader {
  constructor(private workspacePath: string) {}
  
  load() {
    // Implementation would go here
    return { workspace: this.workspacePath };
  }
}

export class Gateway {
  public workspacePath: string;
  public configLoader: ConfigLoader;
  public systemPromptBuilder: SystemPromptBuilder;
  public sessionManager: SessionManager;
  public skillLoader: SkillLoader;

  constructor() {
    this.workspacePath = this.resolveWorkspacePath();
    this.ensureWorkspaceExists();
    
    console.log(`[Gateway] Initialized with workspace: ${this.workspacePath}`);

    // Pass workspacePath to components
    this.configLoader = new ConfigLoader(this.workspacePath);
    this.systemPromptBuilder = new SystemPromptBuilder(this.workspacePath);
    
    // SessionManager typically needs a subdirectory for storage
    this.sessionManager = new SessionManager(path.join(this.workspacePath, 'sessions'));

    // Initialize SkillLoader with two paths
    const internalSkillsPath = path.join(__dirname, 'skills');
    const externalSkillsPath = path.join(this.workspacePath, 'skills');

    this.skillLoader = new SkillLoader([internalSkillsPath, externalSkillsPath]);
    this.skillLoader.loadSkills();
  }

  private resolveWorkspacePath(): string {
    // Override: Use process.cwd()/workspace ONLY if process.env.OPENCLAW_DEV === 'true'
    if (process.env.OPENCLAW_DEV === 'true') {
      return path.join(process.cwd(), 'workspace');
    }
    // Default: ~/.openclaw-learning
    return path.join(os.homedir(), '.openclaw-learning');
  }

  private ensureWorkspaceExists() {
    if (!fs.existsSync(this.workspacePath)) {
      try {
        fs.mkdirSync(this.workspacePath, { recursive: true });
        console.log(`[Gateway] Created workspace directory: ${this.workspacePath}`);
      } catch (err) {
        console.error(`[Gateway] Failed to create workspace directory: ${this.workspacePath}`, err);
        throw err;
      }
    }
  }
}
