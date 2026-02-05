# Task: Define Course and Knowledge Graph Structures

## Context
Based on `docs/design/architecture_v1.md`, section "Course & Progress (Generic DAG)", the system requires a generic Directed Acyclic Graph (DAG) to represent knowledge structure.
> - **Course Metadata**: 定义学科类型 (Coding / Theory / Creative)。
> - **Knowledge Graph**: 通用知识节点依赖图。
> - **Session State**: 当前上下文指针。

## Goal
Create TypeScript interfaces to model the course structure, knowledge dependency graph, and user progress state.

## File Path
`src/core/types/course.ts`

## Key Structures

### 1. KnowledgeNode
Represents a single atomic unit of knowledge (a node in the DAG).
- `id`: string (unique identifier)
- `title`: string
- `description`: string (optional)
- `type`: 'concept' | 'practice' | 'project' (node type)
- `dependencies`: string[] (IDs of prerequisite nodes)
- `estimatedDuration`: number (minutes, optional)

### 2. Course
Represents the entire curriculum or domain map.
- `id`: string
- `title`: string
- `metadata`:
    - `category`: 'coding' | 'theory' | 'creative'
    - `difficulty`: 'beginner' | 'intermediate' | 'advanced'
    - `tags`: string[]
- `nodes`: KnowledgeNode[] (List of all nodes in the graph)

### 3. CourseState
Tracks the user's traversal through the graph.
- `courseId`: string
- `currentNodeId`: string | null (current active focus)
- `completedNodes`: string[] (list of finished node IDs)
- `nodeStatus`: Record<string, 'locked' | 'available' | 'in-progress' | 'completed'>
- `startedAt`: Date
- `lastActiveAt`: Date

## Acceptance Criteria
- [ ] File `src/core/types/course.ts` is created.
- [ ] Interfaces `KnowledgeNode`, `Course`, and `CourseState` are exported.
- [ ] `dependencies` field correctly models the DAG structure.
- [ ] Types are strict and well-documented with JSDoc comments.
