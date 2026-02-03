import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfigLoader } from './config-loader';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
vi.mock('fs');

describe('ConfigLoader', () => {
  const mockWorkspacePath = '/mock/workspace';
  const mockConfigPath = path.join(mockWorkspacePath, 'config.json');

  beforeEach(() => {
    vi.resetAllMocks();
    // Default mock implementation for existsSync to false (file doesn't exist)
    vi.mocked(fs.existsSync).mockReturnValue(false);
  });

  it('should initialize with default config and create file if not exists', () => {
    // Setup mocks
    vi.mocked(fs.existsSync).mockReturnValue(false); // config file missing
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined as any);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    const loader = new ConfigLoader(mockWorkspacePath);
    const config = loader.getConfig();

    // Verify directory creation and file writing
    expect(fs.mkdirSync).toHaveBeenCalledWith(mockWorkspacePath, { recursive: true });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockConfigPath,
      expect.stringContaining('"provider": "custom"'), // Check for default content
      'utf-8'
    );

    // Verify returned config is default
    expect(config.workspacePath).toBe(mockWorkspacePath);
    expect(config.model.provider).toBe('custom');
  });

  it('should load existing config if file exists', () => {
    const userConfig = {
      model: {
        provider: 'openai',
        apiKey: 'test-key',
        modelName: 'gpt-4',
      },
    };

    // Setup mocks
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(userConfig));

    const loader = new ConfigLoader(mockWorkspacePath);
    const config = loader.getConfig();

    expect(fs.readFileSync).toHaveBeenCalledWith(mockConfigPath, 'utf-8');
    expect(config.model.provider).toBe('openai');
    expect(config.model.apiKey).toBe('test-key');
    // Verify it merges with default keys if missing (though here we provided full model object, 
    // but top level structure is merged)
  });

  it('should handle JSON parse error and return default', () => {
    // Setup mocks
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('invalid json {');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const loader = new ConfigLoader(mockWorkspacePath);
    const config = loader.getConfig();

    expect(config.model.provider).toBe('custom'); // Fallback to default
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should reload config', () => {
    // Start with default
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const loader = new ConfigLoader(mockWorkspacePath);
    
    // Change fs state to simulate file update
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
      model: { provider: 'updated', apiKey: 'new', modelName: 'new' }
    }));

    loader.reloadConfig();
    const newConfig = loader.getConfig();

    expect(newConfig.model.provider).toBe('updated');
  });
});
