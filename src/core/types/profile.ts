// src/core/types/profile.ts

/**
 * User Profile Data Models
 * Based on Universal Knowledge Navigator Architecture v1
 */

/**
 * Static attributes of the user that rarely change.
 */
export interface StaticProfile {
  /** The user's current role (e.g., 'Fullstack Dev', 'Student') */
  role: string;
  /** List of learning goals */
  goals: string[];
}

/**
 * Cognitive traits that influence how the agent interacts with the user.
 */
export interface CognitiveProfile {
  /** Preferred learning modality */
  learning_style: 'HANDS_ON' | 'THEORETICAL' | 'VISUAL';
  /** How the user prefers to receive feedback */
  feedback_preference: 'DIRECT' | 'ENCOURAGING' | 'GENTLE';
  /** Known weak points or concepts the user struggles with */
  weak_points?: string[];
  /** Attention span characteristics */
  attention_span?: 'SHORT' | 'LONG';
}

/**
 * Dynamic map of skills and proficiency levels (0.0 - 1.0).
 */
export interface SkillMatrix {
  [skillName: string]: number;
}

/**
 * The complete User Profile, aggregating all layers.
 */
export interface UserProfile {
  static_profile: StaticProfile;
  cognitive_profile: CognitiveProfile;
  skill_matrix: SkillMatrix;
}
