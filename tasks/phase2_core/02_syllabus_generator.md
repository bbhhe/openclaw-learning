# Task: Syllabus Generator Foundation

## Context
根据评估出的用户画像，系统需要从知识图谱中提取相关的知识点，生成一个有序的学习大纲 (Syllabus)。

## Goal
实现 `SyllabusGenerator` 类。

## File Path
`src/core/planning/syllabus.ts`

## Logic
1. **Input**: `UserProfile` + `KnowledgeGraph` (模拟数据或已有的模型)。
2. **Method**: `generate(userId: string): Syllabus`。
3. **Behavior**: 
   - 从 `KnowledgeGraph` 中筛选与用户 Goal 相关的节点。
   - 按照依赖关系 (Dependencies) 进行拓扑排序，生成有序的 `Syllabus` 结构。

## Acceptance Criteria
- 能够返回一个包含多个 `Module` 和 `Unit` 的 `Syllabus` 对象。
- 排序逻辑符合知识依赖。
- 包含单元测试。
