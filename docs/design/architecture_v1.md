# 全域知识领航者 (Universal Knowledge Navigator) - 智能体群架构设计 (v1)

## 1. 核心架构理念：从“教”到“练”的通用闭环

这是一个通用的知识习得系统。我们将智能体分为三个层级，适用于编程语言、系统架构、甚至非技术类学科的学习。

- **决策层 (Decision Layer)**: 负责规划路径、监控进度。
- **执行层 (Execution Layer)**: 负责具体的教学、陪练、纠错。
- **支持层 (Support Layer)**: 负责环境配置、心理激励。

## 2. 智能体角色定义 (Agent Roles)

### 🤖 Agent A: 课程架构师 (The Architect)
- **职责**: 动态规划学习路径 (Syllabus)。
- **功能**:
    - **初始评估**: 根据用户的背景生成定制化大纲。
    - **领域适配**: 加载特定学科（如 Java, Python, 架构设计）的知识图谱。
    - **动态调整**: 监控学习曲线，动态插入补充章节。

### 🎓 Agent B: 费曼导师 (The Feynman Tutor)
- **职责**: 概念讲解与深度理解。
- **机制**: 苏格拉底式教学 + 费曼学习法。
- **行为**: 使用跨领域比喻 (Metaphor) 讲解，要求用户反向复述。

### 💻 Agent C: 实战教练 (The Practice Coach)
- **职责**: 实战演练与技能辅助。
- **行为**: 
    - **Coding场景**: 提供脚手架代码，引导 Debug。
    - **非Coding场景**: 提供案例分析、写作练习或模拟场景。

### 🧐 Agent D: 质量审查官 (The Quality Reviewer)
- **职责**: 产出控制与最佳实践。
- **行为**: 
    - **Coding**: 代码审查 (Linting, Security)。
    - **General**: 逻辑漏洞检查、准确性核对。

### 🏃 Agent E: 项目经理 (The Scrum Master)
- **职责**: 进度管理与里程碑规划。
- **行为**: 
    - **Gamification**: 成就系统 (Badges)。
    - **Daily Sync**: 每日进度同步与目标设定。

### 🔪 Agent F: 任务拆解师 (The Task Architect)
- **职责**: 将需求转化为 AI 可执行的原子任务。
- **目标用户**: Claude Code, Codex, Tare 等 AI 编程工具。
- **行为**: 
    - **Context Awareness**: 分析当前代码库状态，提取必要的上下文（文件路径、依赖关系）。
    - **Prompt Engineering**: 生成包含 "Context + Instruction + Acceptance Criteria" 的精准 Prompt。
    - **Atomic Split**: 将一个 Feature 拆解为多个不可分割的 Step，确保 AI 一次只做一件事。

## 3. 系统拓扑 (Topology)

### 星系结构 (Galaxy Topology)
- **Workspace (星系)**: 用户顶层容器，全局配置/画像/调度。
- **Course (星球)**: 独立业务单元 (如 "Java基础", "OpenClaw开发")，拥有独立智能体群。
- **Agent (卫星)**: 具体执行单元。

### 关键设计
- **领域无关性**: 架构不绑定特定学科，通过配置加载不同的 System Prompts 和 Tools。
- **Global Memory Bridge**: 共享用户元数据 (学习风格、认知偏好)，跨学科复用。

## 4. 数据模型 (Data Model)

### User Profile (分层存储)
```json
{
  "static_profile": { "role": "Fullstack Dev", "goals": ["Master AI Agents", "Learn Rust"] },
  "cognitive_profile": { "learning_style": "HANDS_ON", "feedback_preference": "DIRECT" },
  "skill_matrix": { "java": 0.8, "openclaw": 0.3, "system_design": 0.6 }
}
```

### Course & Progress (Generic DAG)
- **Course Metadata**: 定义学科类型 (Coding / Theory / Creative)。
- **Knowledge Graph**: 通用知识节点依赖图。
- **Session State**: 当前上下文指针。

## 5. 技术栈建议
- **Backend**: Node.js (OpenClaw)
- **Agent Orchestration**: OpenClaw Native (Sessions + Skills)
- **Memory**: Vector DB (知识库), Redis (会话状态)
