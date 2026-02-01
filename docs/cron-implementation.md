# Cron / Scheduler Implementation Guide

## 概述
我们在项目中实现了类似 OpenClaw 的 **Cron (定时任务)** 功能。
这允许 Agent 根据用户的自然语言指令（如“5秒后提醒我”），自动设定未来的任务，并在时间到达时主动触发提醒。

## 架构设计

### 1. 核心组件：`Scheduler` (`src/scheduler.ts`)
这是一个独立的调度器类，充当“酒店前台”的角色。
*   **任务队列**：维护一个内存中的任务列表 `tasks`。
*   **单一动态定时器**：只设定一个 `setTimeout`，指向**最早**需要执行的任务。
*   **事件驱动**：当任务到期时，触发 `trigger` 事件，而不是直接执行业务逻辑。

### 2. 集成点：`Gateway` (`src/gateway.ts`)
*   **工具 (Tool)**：注册了 `schedule_reminder` 工具，让 Agent 能够调用调度器。
*   **事件监听**：监听 `scheduler.on('trigger')`。
*   **广播机制**：当任务触发时，向所有连接到 `Main Session` 的客户端广播消息。

## 关键代码解析

### Scheduler (调度器)
```typescript
// src/scheduler.ts
export class Scheduler extends EventEmitter {
    addTask(content: string, delaySeconds: number) {
        // 1. 计算执行时间
        const dueTime = Date.now() + delaySeconds * 1000;
        // 2. 加入队列
        this.tasks.push({ id, dueTime, content });
        // 3. 重新校准定时器
        this.scheduleNextCheck();
    }

    private scheduleNextCheck() {
        // ...找到最早的任务，设定 setTimeout...
    }
}
```

### Tool Definition (工具定义)
```typescript
// src/gateway.ts
{
    name: "schedule_reminder",
    description: "Schedule a reminder or system event for the future.",
    parameters: {
        type: "object",
        properties: {
            content: { type: "string" },
            delaySeconds: { type: "number" }
        },
        required: ["content", "delaySeconds"]
    }
}
```

## 使用方法

### 启动服务
```bash
npx ts-node src/gateway.ts
```

### 客户端测试
```bash
npx ts-node src/client.ts
```
**输入指令**：
> "Remind me to call Mom in 10 seconds."

**预期结果**：
1.  AI 回复确认："OK, I've scheduled..."
2.  10秒后，控制台收到系统广播：
    > `⏰ SYSTEM REMINDER: call Mom`

## 下一步扩展建议
1.  **持久化**：目前重启服务任务会丢失。可以将 `tasks` 写入 `tasks.json` 文件。
2.  **Cron 表达式**：支持 `Every Monday at 9am` (使用 `croner` 库)。
3.  **独立 Agent**：支持 `Isolated Agent` 模式，在后台运行复杂任务。
