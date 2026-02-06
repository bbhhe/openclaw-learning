import { SyllabusModule } from '../planning/syllabus';
import { getTutorPrompt } from '../prompts/tutor';

/**
 * TutorController
 * 教学流程控制器
 */
export class TutorController {
  /**
   * 启动一个模块的教学流程
   */
  public startModule(module: SyllabusModule): string {
    const prompt = getTutorPrompt(module.title);
    
    // 生成教学开场白 (模拟导师根据 Prompt 生成的第一句话)
    return `导师已就位，准备讲解模块：${module.title}。\n[系统提示词已加载：${prompt.split('\n')[0]}...]`;
  }

  /**
   * 评估用户的反馈 (MVP 桩函数)
   */
  public evaluateFeedback(feedback: string): { understood: boolean; response: string } {
    // 基础逻辑：如果字数太少，视为不理解
    if (feedback.length < 5) {
      return { 
        understood: false, 
        response: "你能试着用自己的话多说一点吗？哪怕是一个小例子也行。" 
      };
    }
    return { 
      understood: true, 
      response: "很有意思的理解！我们接着深入一下..." 
    };
  }
}
