import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import { MemoryBridge } from '../memory/bridge.js';

vi.mock('node:fs');

describe('MemoryBridge', () => {
  const mockPath = 'workspace/storage/user_profile.json';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default profile when file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    
    const bridge = new MemoryBridge(mockPath);
    const context = bridge.getAgentContext();
    
    expect(context).toContain('Role: Student');
    expect(context).toContain('Learning Style: HANDS_ON');
  });

  it('should load and format valid profile', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const mockProfile = {
      static_profile: {
        role: 'Senior Developer',
        goals: ['Master AI', 'Build a startup']
      },
      cognitive_profile: {
        learning_style: 'THEORETICAL',
        feedback_preference: 'GENTLE',
        weak_points: ['CSS', 'Testing']
      },
      skill_matrix: { 'TypeScript': 0.9 }
    };
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockProfile));

    const bridge = new MemoryBridge(mockPath);
    const context = bridge.getAgentContext();

    expect(context).toContain('Role: Senior Developer');
    expect(context).toContain('Goals: Master AI, Build a startup');
    expect(context).toContain('Learning Style: THEORETICAL');
    expect(context).toContain('Feedback Preference: GENTLE');
  });

  it('should handle malformed JSON gracefully', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('invalid json');
    
    const bridge = new MemoryBridge(mockPath);
    const context = bridge.getAgentContext();
    
    expect(context).toContain('Role: Student');
  });
});
