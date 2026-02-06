import { NavigatorOrchestrator } from './core/orchestrator';
import { UserProfile } from './core/types/profile';
import fs from 'fs';

async function runDemo() {
  console.log("==========================================");
  console.log("🚀 全域知识领航者 (Navigator) - MVP 演示");
  console.log("==========================================\n");

  const orchestrator = new NavigatorOrchestrator();

  // 1. 模拟加载当前画像 (binbin)
  const mockProfile: UserProfile = {
    static_profile: { role: '资深开发', goals: ['Master AI Agent Architecture'] },
    cognitive_profile: { learning_style: 'HANDS_ON', feedback_preference: 'DIRECT' },
    skill_matrix: { java: 0.8 }
  };

  console.log("👤 [1/3] 检测到用户画像:");
  console.log(`   - 身份: ${mockProfile.static_profile.role}`);
  console.log(`   - 目标: ${mockProfile.static_profile.goals.join(', ')}`);
  console.log(`   - 风格: ${mockProfile.cognitive_profile.learning_style}\n`);

  // 2. 生成大纲
  console.log("📅 [2/3] 正在根据知识图谱生成个性化大纲...");
  await orchestrator.init(mockProfile, 'java_base');
  const syllabus = orchestrator.getSyllabus();

  if (syllabus) {
    syllabus.modules.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.title}`);
      console.log(`      > ${m.description}`);
    });
  }
  console.log("");

  // 3. 导师进入
  console.log("🎓 [3/3] 正在召唤费曼导师...");
  const intro = orchestrator.start();
  console.log("\n------------------------------------------");
  console.log(intro);
  console.log("------------------------------------------\n");

  console.log("✅ 演示结束。大纲逻辑已全线打通。");
}

runDemo().catch(console.error);
