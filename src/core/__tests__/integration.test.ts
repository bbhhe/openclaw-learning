import { describe, it, expect } from 'vitest';
import { NavigatorOrchestrator } from '../orchestrator';
import { UserProfile } from '../types/profile';

describe('End-to-End Handshake Integration', () => {
  it('should flow from profile to tutor start seamlessly', async () => {
    const orchestrator = new NavigatorOrchestrator();
    
    const mockProfile: UserProfile = {
      static_profile: { role: 'Junior Dev', goals: ['Master Java Collections'] },
      cognitive_profile: { learning_style: 'HANDS_ON', feedback_preference: 'DIRECT' },
      skill_matrix: {}
    };

    // 1. 初始化 (加载知识库并生成大纲)
    await orchestrator.init(mockProfile, 'java_base');
    const syllabus = orchestrator.getSyllabus();
    expect(syllabus).toBeDefined();
    expect(syllabus?.modules.length).toBeGreaterThan(1);

    // 2. 开课 (移交导师)
    const intro = orchestrator.start();
    expect(intro).toContain('导师已就位');
    expect(intro).toContain('Java 基础语法'); // 样板数据中的第一个模块
    expect(intro).toContain('实战版'); // 继承了 HANDS_ON 的风格
  });
});
