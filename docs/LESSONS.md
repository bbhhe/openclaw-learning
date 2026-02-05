# OpenClaw 核心架构课程

本课程旨在通过动手实战，理解 Agentic AI 的核心工作原理。

## ✅ 第一课：神经中枢 (The Nervous System)
**目标**：搭建 WebSocket Gateway，实现最基础的消息收发。
*   **产出**：`gateway.ts` (Echo Server), `client.ts`。

## ✅ 第二课：大脑接入 (The Brain)
**目标**：接入 LLM API，让系统具备“思考”能力。
*   **产出**：Gateway 集成 `askAI`，实现 Session 上下文记忆。

## ✅ 第三课：高可用小脑 (The Cerebellum)
**目标**：实现 Model Router，解决 Token 昂贵和 API 不稳定的问题。
*   **产出**：
    *   `src/router.ts`: 负载均衡、熔断、限速处理 (429 Backoff)。
    *   `src/config.ts`: 多模型池配置。

## ✅ 第四课：赋予双手 (The Hands)
**目标**：实现 Tool Calling (工具调用)，让 AI 能执行系统命令。
*   **产出**：
    *   `src/gateway.ts`: 实现 ReAct (思考-行动) 循环。
    *   `exec` 工具：基于 `child_process` 的命令执行器。

## ✅ 第五课：技能加载器 (The Skill Loader)
**目标**：实现动态技能加载，通过 Prompt 扩展 AI 能力。
*   **原理**：Instruction Tuning (指令微调) / In-Context Learning (上下文学习)。
*   **产出**：
    *   `src/skill-loader.ts`: 扫描并读取 `.md` 文件。
    *   `src/skills/`: 技能存放目录。
    *   **System Prompt Injection**: 启动时自动注入技能知识。

## ✅ 第六课：慧眼 (The Eyes)
**目标**：打破纯文本限制，让 Agent 能“看”到图片。
*   **挑战**：WebSocket 传输二进制/Base64，OpenAI 格式的消息构造。
*   **产出**：
    *   `src/types.ts`: 升级 Message 类型支持 `ContentPart[]`。
    *   `src/router.ts`: 适配 Vision Model (如 gpt-4o, claude-3.5-sonnet)。
