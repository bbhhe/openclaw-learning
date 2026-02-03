import * as fs from 'fs';
import * as path from 'path';

export interface ModelConfig {
  provider: string;
  baseUrl?: string;
  apiKey: string;
  modelName: string;
}

export interface WorkspaceConfig {
  workspacePath: string;
  models: ModelConfig[]; // Array of models
  defaultModel?: string; // Optional: name of the default model to use
}

export class ConfigLoader {
  private config: WorkspaceConfig;
  private configPath: string;

  constructor(workspacePath: string = path.resolve(process.cwd(), 'workspace')) {
    this.configPath = path.join(workspacePath, 'config.json');
    this.config = this.loadConfig(workspacePath);
  }

  private loadConfig(workspacePath: string): WorkspaceConfig {
    const defaultConfig: WorkspaceConfig = {
      workspacePath: workspacePath,
      models: [{
        provider: 'custom',
        baseUrl: 'https://api.example.com/v1',
        apiKey: 'your-api-key-here',
        modelName: 'model-name-here',
      }],
      defaultModel: 'model-name-here'
    };

    if (!fs.existsSync(this.configPath)) {
      console.log(`Config file not found. Initializing default workspace at ${workspacePath}`);
      
      try {
        if (!fs.existsSync(workspacePath)) {
            fs.mkdirSync(workspacePath, { recursive: true });
        }
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
      
      // Handle legacy config (single model object) -> convert to array
      if (userConfig.model && !userConfig.models) {
          userConfig.models = [userConfig.model];
          delete userConfig.model;
      }

      return {
        ...defaultConfig,
        ...userConfig,
        workspacePath: workspacePath,
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
