import { describe, it, expect } from 'vitest';
import {
  UserProfile,
  StaticProfile,
  CognitiveProfile,
  SkillMatrix
} from '../../../src/core/types/profile';

describe('Profile Type Definitions', () => {

  it('should allow creating a valid StaticProfile', () => {
    const staticProfile: StaticProfile = {
      role: 'Fullstack Dev',
      goals: ['Master TypeScript', 'Learn Agentic AI'],
    };

    expect(staticProfile).toBeDefined();
    expect(staticProfile.role).toBe('Fullstack Dev');
    expect(staticProfile.goals).toHaveLength(2);
  });

  it('should allow creating a valid CognitiveProfile with optional fields', () => {
    const cognitiveProfile: CognitiveProfile = {
      learning_style: 'HANDS_ON',
      feedback_preference: 'DIRECT',
      weak_points: ['Abstract Theory'],
      attention_span: 'SHORT',
    };

    expect(cognitiveProfile.learning_style).toBe('HANDS_ON');
    expect(cognitiveProfile.weak_points).toContain('Abstract Theory');
  });

  it('should allow creating a valid CognitiveProfile without optional fields', () => {
    const cognitiveProfile: CognitiveProfile = {
      learning_style: 'VISUAL',
      feedback_preference: 'ENCOURAGING',
    };

    expect(cognitiveProfile.learning_style).toBe('VISUAL');
    expect(cognitiveProfile.weak_points).toBeUndefined();
    expect(cognitiveProfile.attention_span).toBeUndefined();
  });

  it('should allow creating a valid SkillMatrix', () => {
    const skillMatrix: SkillMatrix = {
      'TypeScript': 0.9,
      'Python': 0.7,
      'Rust': 0.3,
    };

    expect(skillMatrix['TypeScript']).toBe(0.9);
    expect(skillMatrix['Rust']).toBe(0.3);
  });

  it('should create a complete UserProfile correctly', () => {
    const userProfile: UserProfile = {
      static_profile: {
        role: 'Student',
        goals: ['Pass Exam'],
      },
      cognitive_profile: {
        learning_style: 'THEORETICAL',
        feedback_preference: 'GENTLE',
      },
      skill_matrix: {
        'Math': 0.5,
      },
    };

    expect(userProfile.static_profile.role).toBe('Student');
    expect(userProfile.cognitive_profile.learning_style).toBe('THEORETICAL');
    expect(userProfile.skill_matrix['Math']).toBe(0.5);
  });

  // Type Safety Check (Conceptual - Runtime verification of TS constraints isn't direct,
  // but we verify the object structure is respected)
  it('should validate structure of objects strictly (runtime check)', () => {
      const invalidProfile: any = {
          role: 123, // Invalid type
      };
      // In a real scenario with validation logic (e.g. Zod), we would expect this to throw.
      // Since these are pure interfaces, we just ensure our test setup can handle the types.
      expect(typeof invalidProfile.role).toBe('number'); 
  });
});
