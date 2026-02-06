# Task: Architect Assessment Prompt

## Context
课程架构师 (Agent A) 需要通过对话评估用户的背景、目标和学习风格，以构建完整的 `UserProfile`。

## Goal
设计并存储 Agent A 的系统提示词 (System Prompt)。

## File Path
`src/core/prompts/architect.ts`

## Requirements
1. **Persona**: 专业的课程设计专家，语气严谨且富有引导性。
2. **Input**: 用户的初始对话内容。
3. **Output Format**: 引导用户提供以下信息：
   - 编程经验 (Junior/Senior)
   - 具体目标 (Goal)
   - 偏好的学习风格 (Hands-on/Theoretical)
4. **Logic**: 包含一个 `getAssessmentPrompt()` 函数，返回该字符串。

## Acceptance Criteria
- 提示词包含明确的角色定义和任务目标。
- 导出的字符串不为空。
