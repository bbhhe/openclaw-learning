// 限制历史记录的长度，防止 Context Window 爆炸
// 策略：只保留最近 N 个 User Turns (以及对应的 Assistant 回复)
export function limitHistory(history: any[], maxUserTurns: number): any[] {
    if (history.length === 0 || maxUserTurns <= 0) return history;

    // 始终保留 System Prompt (通常是第一条)
    let systemMessage: any = null;
    if (history[0].role === 'system') {
        systemMessage = history[0];
    }

    // 倒序计数
    let userCount = 0;
    let cutIndex = -1;

    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].role === 'user') {
            userCount++;
            if (userCount > maxUserTurns) {
                cutIndex = i + 1; // 截断点：保留这条 user 之后的所有内容
                break;
            }
        }
    }

    // 如果没超过限制，原样返回
    if (cutIndex === -1) return history;

    // 如果超过限制，截取后半部分
    const keptMessages = history.slice(cutIndex);

    // 确保 System Prompt 不丢失
    if (systemMessage && keptMessages[0]?.role !== 'system') {
        return [systemMessage, ...keptMessages];
    }

    return keptMessages;
}
