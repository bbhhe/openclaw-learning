# Task: CLI Demo Script

## Context
MVP 需要直观的演示界面，以便向用户展示从画像评估到导师开讲的全过程。

## Goal
实现 `src/demo.ts` 交互式演示脚本。

## Logic
1. 初始化 `NavigatorOrchestrator`。
2. 打印欢迎语和检测到的 `UserProfile` 摘要。
3. 展示生成的 `Syllabus` (Module 列表)。
4. 输出导师针对第一个模块的开场白。
5. 将结果导出为 `demo_output.md`。

## Acceptance Criteria
- 运行 `npx ts-node src/demo.ts` 能够完整跑通流程。
- 输出内容清晰、可读性强。
