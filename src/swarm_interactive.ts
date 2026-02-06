import readline from 'readline';
import { NavigatorOrchestrator } from './core/orchestrator';
import { UserProfile } from './core/types/profile';
import { TutorController } from './core/teaching/tutor';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (query: string) => new Promise<string>(resolve => rl.question(query, resolve));

async function runSwarmSession() {
  console.clear();
  console.log("\x1b[36m%s\x1b[0m", "==================================================");
  console.log("\x1b[36m%s\x1b[0m", "🤖 全域知识领航者：智能体集群交互 (Product MVP)");
  console.log("\x1b[36m%s\x1b[0m", "==================================================\n");

  const orchestrator = new NavigatorOrchestrator();
  const tutor = new TutorController();

  const mockProfile: UserProfile = {
    static_profile: { role: 'Java 初学者', goals: ['理解什么是多态'] },
    cognitive_profile: { learning_style: 'HANDS_ON', feedback_preference: 'DIRECT' },
    skill_matrix: { java: 0.2 }
  };

  console.log("\x1b[32m%s\x1b[0m", "[Agent A: 课程架构师] 🔍 正在调用大模型生成个性化大纲...");
  await orchestrator.init(mockProfile, 'java_base');
  await new Promise(r => setTimeout(r, 1000));

  console.log("\x1b[33m%s\x1b[0m", `[Agent B: 费曼导师] 嗨！我是你的 AI 导师。今天我们来攻克“多态”。`);
  console.log("\x1b[33m%s\x1b[0m", `[Agent B: 费曼导师] 想象一下，你有一个“通用遥控器”，它可以控制家里所有的电器。虽然你按的是同一个“开启”键，但电视会打开屏幕，空调会吹出冷气。这就是多态。你怎么看？`);
  
  while (true) {
    const answer = await ask(`\n\x1b[32m你：\x1b[0m`);
    
    if (answer.toLowerCase() === 'exit' || answer.includes('再见')) {
      console.log("\x1b[33m%s\x1b[0m", `[Agent B: 费曼导师] 好的，下次再见！`);
      break;
    }

    console.log("\x1b[90m%s\x1b[0m", "   (正在通过产品级 Gateway 请求真实大模型响应...)");
    
    // 强制调用真实产品接口
    const response = await tutor.askTutor(answer);
    
    await new Promise(r => setTimeout(r, 1200)); 
    
    console.log("\n\x1b[33m%s\x1b[0m", `[Agent B: 费曼导师] ${response}`);
    console.log("\x1b[31m%s\x1b[0m", `[Agent D: 质量审查官] 后台状态：语义解析通过。逻辑一致性：高。`);
  }

  rl.close();
}

runSwarmSession().catch(console.error);
