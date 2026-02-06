# Task: Data-Driven Syllabus Refactor

## Context
目前的 `SyllabusGenerator` 是硬编码的。需要将其改为从知识图谱 JSON 中读取数据。

## Goal
重构 `SyllabusGenerator.generate()` 方法。

## Logic
1. **Input**: `UserProfile` + `knowledgeFilePath: string`。
2. **Processing**:
   - 加载指定路径的 JSON 文件。
   - 解析为 `KnowledgeGraph`。
   - 实现一个简单的拓扑排序或依赖过滤算法。
   - 匹配用户 Goal 相关的节点。
3. **Output**: 动态生成的 `Syllabus`。

## Acceptance Criteria
- 成功读取外部 JSON 并生成大纲。
- 如果知识库文件不存在，应有优雅的报错或默认处理。
- 单元测试覆盖动态加载场景。
