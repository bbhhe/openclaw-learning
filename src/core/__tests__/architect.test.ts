import { describe, it, expect } from 'vitest';
import { getAssessmentPrompt } from '../prompts/architect';
import { SyllabusGenerator } from '../planning/syllabus';
import { UserProfile } from '../types/profile';
import { KnowledgeGraph } from '../types/knowledge';
import path from 'path';

describe('Architect Core - Data Driven', () => {
  const mockGraph: KnowledgeGraph = {
    courseId: 'test',
    version: '1.0',
    nodes: [
      { id: '1', title: 'T1', description: 'D1', dependencies: [], difficulty: 1, estimatedMinutes: 10, tags: [] }
    ]
  };

  const mockProfile: UserProfile = {
    static_profile: { role: 'Student', goals: ['Test'] },
    cognitive_profile: { learning_style: 'HANDS_ON', feedback_preference: 'DIRECT' },
    skill_matrix: {}
  };

  it('should generate syllabus from graph object', () => {
    const generator = new SyllabusGenerator();
    const syllabus = generator.generate(mockProfile, mockGraph);
    expect(syllabus.modules[0].title).toBe('T1 (实战版)');
  });

  it('should generate syllabus from JSON file', () => {
    const generator = new SyllabusGenerator();
    const filePath = path.join(process.cwd(), 'workspace/knowledge/java_base.json');
    const syllabus = generator.generateFromFile(mockProfile, filePath);
    expect(syllabus.modules.length).toBe(3);
    expect(syllabus.modules[0].title).toContain('Java 基础语法');
  });
});
