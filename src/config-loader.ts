import * as fs from 'fs';
import * as path from 'path';

export interface ModelConfig {
  provider: string; // e.g., 'openai', 'gemini', 'custom'
  baseUrl?: string;
  apiKey: string;
  modelName: string;
}

export interface WorkspaceConfig {
  workspacePath: string;
  model: ModelConfig;
}

export class ConfigLoader {
  private config: WorkspaceConfig;
  private configPath: string;

  constructor(workspacePath: string = path.resolve(process.cwd(), 'workspace')) {
    // Default workspace path is ./workspace relative to cwd if not provided
    this.configPath = path.join(workspacePath, 'config.json');
    this.config = this.loadConfig(workspacePath);
  }

  private loadConfig(workspacePath: string): WorkspaceConfig {
    const defaultConfig: WorkspaceConfig = {
      workspacePath: workspacePath,
      model: {
        provider: 'custom',
        baseUrl: 'https://api.example.com/v1',
        apiKey: 'your-api-key-here',
        modelName: 'model-name-here',
      },
    };

    if (!fs.existsSync(this.configPath)) {
      console.log(`Config file not found. Initializing default workspace at ${workspacePath}`);
      
      try {
        // Ensure workspace directory exists
        if (!fs.existsSync(workspacePath)) {
            fs.mkdirSync(workspacePath, { recursive: true });
        }

        // Write default config to file
        fs.writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
        console.log(`✅ Created default config at ${this.configPath}`);
      } catch (err) {
        console.error(`Failed to initialize workspace:`, err);
      }

      return defaultConfig;
    }

    try {
      const fileContent = fs.readFileSync(this.configPath, 'utf-8');
      const userConfig = JSON.parse(fileContent);
      
      // Merge user config with default structure (shallow merge for simplicity)
      return {
        ...defaultConfig,
        ...userConfig,
        workspacePath: workspacePath, // Ensure workspace path is consistent
      };
    } catch (error) {
      console.error(`Error loading config from ${this.configPath}:`, error);
      return defaultConfig;
    }
  }

  public getConfig(): WorkspaceConfig {
    return this.config;
  }

  public reloadConfig(): void {
    this.config = this.loadConfig(this.config.workspacePath);
  }
}
