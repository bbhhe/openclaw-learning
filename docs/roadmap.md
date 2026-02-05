# Java 领航者 (Java Navigator) - 实施路线图 (Roadmap)

本文档规划了 "Java 领航者" 智能体系统的开发里程碑。基于 [Architecture v1](./design/architecture_v1.md) 设计。

## Phase 1: 基础设施与地基搭建 (Infrastructure Foundation)
**目标**: 建立可运行的智能体宿主环境，完成数据持久化设计。

### 1.1 数据模型设计与实现 (Data Modeling)
- [ ] **Schema 定义**: 设计 MySQL 表结构 (User, Course, KnowledgeNode, Progress)。
- [ ] **用户画像存储**: 实现 JSON 结构的 User Profile (Static/Cognitive/Skill Matrix) 存取。
- [ ] **知识图谱原型**: 定义基础 Java 知识树结构 (DAG) 并持久化。

### 1.2 OpenClaw 集成 (System Integration)
- [ ] **工作区初始化**: 在 OpenClaw 中配置 `Workspace` (星系) 结构。
- [ ] **全局记忆桥 (Memory Bridge)**: 实现跨 Agent 的用户画像共享机制。
- [ ] **沙箱环境**: 验证每个 Course 的独立运行沙箱，确保上下文隔离。

### 1.3 基础服务
- [ ] 数据库服务搭建 (MySQL + Redis)。
- [ ] 向量数据库接入 (用于长短期记忆)。

---

## Phase 2: 核心大脑开发 (Core Agents Development)
**目标**: 赋予系统“规划”与“教学”的核心能力。

### 2.1 Agent A: 课程架构师 (The Architect)
- [ ] **评估模块**: 开发初始评估对话流，生成用户画像。
- [ ] **路径规划算法**: 基于画像和知识图谱生成个性化 `Syllabus`。
- [ ] **动态调整**: 实现根据用户反馈更新学习路径的逻辑。

### 2.2 Agent B: 费曼导师 (The Feynman Tutor)
- [ ] **教学提示词工程**: 设计苏格拉底式提问的 System Prompt。
- [ ] **比喻生成器**: 针对特定概念 (如 OOP, JVM) 优化比喻解释能力。
- [ ] **复述校验**: 开发逻辑判断模块，评估用户对概念的反向复述准确度。

---

## Phase 3: 交互层与 MVP 验证 (Interaction & MVP)
**目标**: 完成闭环体验，验证“教”与“练”的协同。

### 3.1 交互层开发
- [ ] **多 Agent 调度**: 实现 Architect 与 Tutor 之间的握手 (Architect 制定计划 -> 移交 Tutor 执行)。
- [ ] **前端交互适配**: 适配命令行或 Web 聊天界面，展示教学大纲和进度。

### 3.2 辅助 Agent (MVP Scope)
- [ ] **Agent C (Pair Programmer) 原型**: 实现简单的代码填空题生成与校验。
- [ ] **Agent E (Scrum Master) 简版**: 实现简单的任务拆解和每日进度追踪。

### 3.3 MVP 验收测试
- [ ] **场景测试**: 模拟一名 "Java 初学者" 完成 "Java 基础语法" 模块的全流程。
- [ ] **反馈循环**: 收集 LLM 响应延迟、上下文丢失率等关键指标。

---

## 未来规划 (Beyond MVP)
- 引入 Agent D (Code Reviewer) 进行深度代码审计。
- 增强 Gamification (成就系统)。
- 扩展至 Spring Boot 等高级课程。
