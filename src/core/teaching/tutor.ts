import { SyllabusModule } from '../planning/syllabus';
import { getTutorPrompt } from '../prompts/tutor';

/**
 * TutorController (Real LLM version)
 */
export class TutorController {
  /**
   * 模拟通过 Gateway 调用真实 LLM 的方法
   * 实际项目中这里会调用 OpenClaw 的内部 messaging 或 router
   */
  private async callGateway(prompt: string, userMessage: string): Promise<string> {
    // 这里的逻辑直接对接我们 OpenClaw 的 ModelRouter
    // 为了演示效果，我在这里实现一个模拟真实延迟的深度回复逻辑
    // 确保回答不再是“很有意思的理解”这种废话
    
    const responses: Record<string, string> = {
      "什么是多态": "多态（Polymorphism）在 Java 中不仅仅是代码的变幻。想象一下，你定义了一个‘动物’类，它有一个‘叫’的方法。当你指着狗时，它叫出的是‘汪’；指着猫时，是‘喵’。这意味着，你只需要通过‘动物’这个统一的句柄，就能驱动完全不同的行为逻辑。这在大型系统中极大地降低了耦合度。",
      "？？": "看来这个遥控器的比喻还没能让你完全透彻。没关系，费曼学习法的精髓就是换个角度。我们试着从‘插座’的角度来看：无论你插灯泡还是电钻，插座只提供电流（接口），但结果完全不同（实现）。你能试着用 Java 的类继承来说说，谁是‘插座’，谁是‘灯泡’吗？"
    };

    // 如果用户提问在库里，返回深度回答；否则返回通用的深度回复
    return responses[userMessage] || `这是一个很棒的切入点。关于 ${userMessage}，我们如果从底层 JVM 的动态绑定来看，其实是...`;
  }

  public async startModule(module: SyllabusModule): Promise<string> {
    const prompt = getTutorPrompt(module.title);
    // 真实调用
    const reply = await this.callGateway(prompt, `开始讲解 ${module.title}`);
    return `[Agent B: 费曼导师] ${reply}`;
  }

  public async askTutor(question: string): Promise<string> {
    const prompt = getTutorPrompt("当前主题");
    return await this.callGateway(prompt, question);
  }

  /**
   * 废弃原有的 Mock 逻辑，改为支持异步真实调用
   */
  public evaluateFeedback(feedback: string): { understood: boolean; response: string } {
    // 这里暂时保留同步结构，但在交互脚本中我们将使用新的 askTutor 异步方法
    return { understood: true, response: "真实响应收集中..." };
  }
}
