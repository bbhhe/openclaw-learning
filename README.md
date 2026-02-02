# OpenClaw Learning MVP

这是一个用于学习和构建 Agentic AI 核心架构的最小可行性产品 (MVP)。
通过本项目，我们从零实现了 OpenClaw 的核心组件：Gateway、Agent、Router、Tools、Scheduler 和 Skill Loader。

## 🏗 架构设计

### 核心概念：Hub & Spoke (中心与辐条)
*   **Gateway (The Hub)**: 系统的神经中枢，基于 WebSocket。
*   **Agent (The Brain)**: 负责思考和生成回复的大脑。
*   **Router (The Cerebellum)**: 负责高可用模型调度的小脑。
*   **Scheduler (The Clock)**: 负责定时任务和提醒的调度器。
*   **ProcessManager (The Worker)**: 负责管理后台进程和交互式任务。
*   **Tools (The Hands)**: 负责执行操作的双手 (exec, bash, process)。
*   **Skills (The Knowledge)**: 动态加载的技能库 (Prompt Injection)。

### 数据流向
```mermaid
graph TD
    User[用户 CLI] -- 1. 提问 --> Gateway
    Gateway -- 2. 加载技能 --> SkillLoader[Skill Loader]
    SkillLoader -- 3. 注入 Prompt --> Session
    Gateway -- 4. 路由 --> Router
    Router -- 5. 调用 API --> LLM
    LLM -- 6. Tool Call --> Gateway
    Gateway -- 7a. Exec --> System[操作系统]
    Gateway -- 7b. Schedule --> Scheduler[调度器]
    Gateway -- 7c. Bash --> ProcessManager[后台进程]
    Scheduler -- 8a. Trigger --> Gateway
    ProcessManager -- 8b. Log/Exit --> Gateway
    System -- 8c. 结果 --> Gateway --> LLM
    LLM -- 9. 最终回复 --> User
```

## 🧩 核心模块

### 1. Gateway (`src/gateway.ts`)
- 启动 WebSocket Server。
- **Session Management**: 实现了类似 OpenClaw 的 "Main Session" 模式，支持断线重连和上下文保持。[查看文档](./docs/session-management.md)
- **ReAct Loop**: 处理 "思考-行动-观察" 的递归循环。
- **Skill Injection**: 启动时注入 `src/skills/` 下的技能。

### 2. Model Router (`src/router.ts`)
- **高可用**: 维护模型池，支持故障切换 (Failover)。
- **速率限制**: 智能处理 429 限速，自动冷却。
- **Tool Support**: 支持传递工具定义和处理 `tool_calls`。

### 3. Skill Loader (`src/skill-loader.ts`)
- 自动扫描 `src/skills/<name>/skill.md`。
- 将 Markdown 文件转换为 System Prompt，赋予 Agent 新知识。

### 4. Scheduler (`src/scheduler.ts`)
- **单一动态定时器**: 高效管理未来的提醒任务。
- **System Event**: 任务到期时广播消息并注入到聊天历史中。[查看文档](./docs/cron-implementation.md)

### 5. ProcessManager (`src/process-manager.ts`)
- **后台任务**: 支持 `spawn` 启动长耗时进程。
- **交互能力**: 支持 `stdin` 输入，可与 CLI 工具交互。[查看文档](./docs/process-manager.md)

### 6. Client (`src/client.ts`)
- 命令行聊天工具。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置 API Key
编辑 `src/config.ts`，填入你的 LLM API Key。

### 3. 添加技能 (可选)
在 `src/skills/` 目录下创建子目录和 `skill.md`（如 `src/skills/git/skill.md`），写上教 AI 如何使用 `exec` 完成任务的指令。

### 4. 启动
```bash
# 启动服务端
npm run gateway

# 启动客户端
npm run client

### 4.1 启动 Web 客户端 (新增)
启动 Gateway 后，直接浏览器访问：
http://localhost:3000

即可使用类似微信的网页版聊天界面。

```

### 5. 测试定时任务
对 AI 说："5秒后提醒我喝水"。

### 6. 测试后台进程
对 AI 说："在后台运行 ping 百度"。

## 📚 学习路径
详情请见 [docs/LESSONS.md](./docs/LESSONS.md)。
