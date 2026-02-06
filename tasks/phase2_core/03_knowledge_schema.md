# Task: Knowledge Graph Schema

## Context
为了支持动态课程规划，需要定义一套通用的知识节点数据结构，能够描述知识点之间的依赖关系。

## Goal
定义 `KnowledgeNode` 和 `KnowledgeGraph` 接口。

## File Path
`src/core/types/knowledge.ts`

## Structure Requirements
- `id`: string
- `title`: string
- `description`: string
- `dependencies`: string[] (前置知识点的 ID)
- `difficulty`: 1-5
- `estimatedMinutes`: number
- `tags`: string[]

## Acceptance Criteria
- 导出的类型定义清晰。
- 包含基本的 TypeScript 接口导出。
