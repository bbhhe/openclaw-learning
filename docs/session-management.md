# Session Management: "Main Session" Pattern

## 目标
实现类似 OpenClaw 的 **Main Session (主会话)** 机制：
1.  **单例模式**：无论开启多少个浏览器标签或客户端，所有连接都共享同一个会话上下文。
2.  **持久化连接**：连接断开（刷新页面、关闭窗口）不导致会话数据丢失。
3.  **自动恢复**：新连接自动挂载到已存在的会话上。

## 实现原理

我们将 Session 对象与 WebSocket 连接解耦。

### 1. 数据结构变更
原本直接使用 WS 作为 Key：
```typescript
// ❌ 旧模式：连接即会话
Map<WebSocket, Session>
```

现在改为 ID 作为 Key，并增加映射表：
```typescript
// ✅ 新模式：ID 即会话
Map<string, Session>      // 存储会话数据 (Key: "main")
Map<WebSocket, string>    // 存储连接关系 (WS -> "main")
```

### 2. 核心逻辑 (`src/gateway.ts`)

```typescript
const sessions = new Map<string, Session>();
const connectionMap = new Map<WebSocket, string>();

wss.on('connection', (ws) => {
    // 1. 强制指定 SessionID 为 "main" (单用户模式)
    const sessionKey = "main"; 
    
    // 2. 尝试查找已存在的 Session
    let session = sessions.get(sessionKey);
    
    if (!session) {
        // [新建] 如果不存在，初始化新 Session
        console.log(`✨ Creating new Main Session: ${sessionKey}`);
        session = { history: [...] };
        sessions.set(sessionKey, session);
    } else {
        // [恢复] 如果存在，直接复用
        console.log(`♻️ Resuming existing Main Session: ${sessionKey}`);
        // 可选：发送欢迎/恢复消息
    }

    // 3. 绑定连接关系
    connectionMap.set(ws, sessionKey);

    ws.on('message', (msg) => {
        // 4. 发消息时，通过映射表找回 Session
        const key = connectionMap.get(ws);
        const session = sessions.get(key);
        // ...处理逻辑...
    });

    ws.on('close', () => {
        // 5. 断开时只删映射，保留 Session 数据！
        connectionMap.delete(ws); 
        console.log("🔌 Disconnected (Session persisted)");
    });
});
```

## 测试验证

运行日志证明了机制生效：

```
🚀 Gateway is listening...
🔌 New connection established
✨ Creating new Main Session: main        <-- 第一次连接，新建
👂 Received: My name is Binbin.
🧠 AI Says: Nice to meet you, Binbin!
🔌 Disconnected (Session persisted)       <-- 第一次断开，数据保留

🔌 New connection established
♻️ Resuming existing Main Session: main (3 msgs) <-- 第二次连接，成功恢复！
```

这意味着即便你关闭了网页再重新打开，AI 依然记得你刚才说的话（"My name is Binbin"）。
