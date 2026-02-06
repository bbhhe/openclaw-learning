# Task: Navigator Orchestrator

## Context
需要一个核心组件来管理整个教学生命周期，协调架构师和大纲生成器，最后将任务交给导师。

## Goal
实现 `NavigatorOrchestrator` 类。

## File Path
`src/core/orchestrator.ts`

## Logic
1. **initSession(profile: UserProfile)**:
   - 接收用户画像。
   - 调用 `SyllabusGenerator` 加载指定的知识星球（如 `java_base.json`）。
   - 存储生成的 `Syllabus` 到内存状态中。
2. **startTeaching()**:
   - 获取 `Syllabus` 中的第一个 Module。
   - 调用 `TutorController.startModule()`。
   - 返回导师的开场文本。

## Acceptance Criteria
- 能够从 Profile 一键流转到导师开场。
- 包含端到端集成测试。
