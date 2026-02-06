# Task: Teaching Controller Foundation

## Context
需要一个类来驱动教学流程，将大纲中的 Module 转化为导师的开场白。

## Goal
实现 `TutorController` 类。

## File Path
`src/core/teaching/tutor.ts`

## Logic
1. **Method**: `startModule(module: SyllabusModule): string`。
2. **Behavior**: 
   - 获取当前模块的主题。
   - 调用 `getTutorPrompt` 生成针对该主题的教学环境。
   - 返回导师的开场引导语（如：“今天我们来聊聊 ${module.title}，你觉得它像生活中的什么？”）。

## Acceptance Criteria
- 成功结合 `SyllabusModule` 生成教学文本。
- 包含单元测试。
