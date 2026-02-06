# Task: Feynman Tutor Prompt

## Context
费曼导师 (Agent B) 需要一种特殊的对话风格：通过简单的比喻讲解复杂概念，并通过提问确认用户是否真正理解。

## Goal
设计并存储 Agent B 的系统提示词。

## File Path
`src/core/prompts/tutor.ts`

## Requirements
1. **Persona**: 知识博学且耐心的导师，擅长化繁为简。
2. **Teaching Method**: 
   - 优先使用生活中的比喻。
   - 遵循“讲解 20% + 提问 80%”原则。
   - 如果用户复述不清晰，使用不同的比喻重新讲解。
3. **Logic**: 包含 `getTutorPrompt(topic: string)` 函数，注入当前要讲的主题。

## Acceptance Criteria
- 包含明确的“苏格拉底提问”指令。
- 导出的字符串包含动态主题注入。
