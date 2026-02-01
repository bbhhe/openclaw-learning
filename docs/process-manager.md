# Process Manager & Coding Agent Implementation

## 概述
我们为 Agent 赋予了**后台进程管理**的能力。
原本的 `exec` 工具只能执行“一波流”的短命令（执行完就退出），无法处理长时间运行的任务（如 `npm start`）或交互式任务（如 `claude`）。
引入 `ProcessManager` 后，Agent 可以启动持久化进程，并与之交互。

## 架构设计

### 1. 核心组件：`ProcessManager` (`src/process-manager.ts`)
*   **Spawn vs Exec**: 使用 Node.js 的 `spawn` 替代 `exec`。`spawn` 允许我们实时获取 `stdout/stderr` 流，而不是等进程结束才一次性获取。
*   **Session Management**: 维护一个 `sessions` Map，将每个后台进程绑定到一个唯一的 ID。
*   **交互能力**: 提供了 `write()` 方法，允许将数据写入进程的 `stdin`（标准输入）。这使得 Agent 可以回答 CLI 工具的提问（如 "Do you want to continue? [y/N]"）。

### 2. 新增工具 (`src/gateway.ts`)

#### `bash`
启动一个后台进程。
```json
{
  "name": "bash",
  "arguments": {
    "command": "ping -c 10 localhost",
    "workdir": "/home/user/project"
  }
}
```
**返回**: `Started background session. ID: <sessionId>`

#### `process`
管理已有进程。
*   `action: "log"`: 获取最新的输出日志。
*   `action: "write"`: 发送输入（记得加 `\n`）。
*   `action: "kill"`: 终止进程。

### 3. 技能适配 (`src/skills/coding-agent/skill.md`)
我们迁移并简化了 OpenClaw 的 `coding-agent` 技能。
*   **适配点**: 原版依赖 `node-pty` 提供伪终端（颜色、光标控制）。由于环境限制，我们改用纯 `spawn` 管道实现。
*   **效果**: 虽然没有颜色，但依然具备完整的读写交互能力，足以支持 Claude Code 或 Codex CLI 运行。

## 使用场景
1.  **长时间构建**: "在后台运行 `npm install`，完成后告诉我。"
2.  **交互式重构**: "用 Claude 重构 `utils.ts`。"（Agent 可以在 Claude 询问确认时发送 "y"）。
3.  **服务监控**: "启动一个 ping 任务监控服务器，每隔一会儿检查一下日志。"

## 限制
*   **无 PTY**: 输出中不包含颜色代码，且不支持全屏 CLI 应用（如 vim）。
*   **内存**: 目前日志保存在内存中（有简单的长度截断），重启 Gateway 会丢失进程引用（进程变成孤儿或被杀）。
