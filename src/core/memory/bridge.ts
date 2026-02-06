import fs from 'fs';
import path from 'path';
import { UserProfile } from '../types/profile';

/**
 * MemoryBridge
 * 负责从持久化存储加载用户画像，并为其他智能体提供上下文
 */
export class MemoryBridge {
  private profilePath: string;

  constructor(profilePath?: string) {
    this.profilePath = profilePath ? path.resolve(profilePath) : path.join(process.cwd(), 'workspace/storage/user_profile.json');
  }

  /**
   * 加载用户画像并返回格式化的上下文字符串
   */
  public getAgentContext(): string {
    const defaultContext = `Role: Student\nGoals: None specified\nLearning Style: HANDS_ON\nFeedback Preference: DIRECT`;

    if (!fs.existsSync(this.profilePath)) {
      return defaultContext;
    }

    try {
      const data = fs.readFileSync(this.profilePath, 'utf-8');
      if (!data.trim()) return defaultContext;
      
      const profile: UserProfile = JSON.parse(data);

      return `Role: ${profile.static_profile.role}
Goals: ${profile.static_profile.goals.join(', ')}
Learning Style: ${profile.cognitive_profile.learning_style}
Feedback Preference: ${profile.cognitive_profile.feedback_preference}
Skill Levels: ${Object.entries(profile.skill_matrix).map(([k, v]) => `${k}:${v}`).join(', ')}`;
    } catch (error) {
      console.error('Failed to parse user profile:', error);
      return defaultContext;
    }
  }
}
