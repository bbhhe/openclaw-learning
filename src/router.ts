import { modelPool, ModelProvider } from './config';
import { logger } from './logger';

export class ModelRouter {
    private pool: ModelProvider[] = modelPool;

    private getHealthyProvider(): ModelProvider | null {
        const now = Date.now();
        return this.pool.find(p => {
            if (p.status === 'healthy') return true;
            if (p.status === 'busy' && p.busyUntil && p.busyUntil <= now) {
                logger.info(`[Router] 🔓 Provider ${p.id} rate limit reset!`);
                p.status = 'healthy';
                p.busyUntil = undefined;
                return true;
            }
            return false;
        }) || null;
    }

    private markAsSick(provider: ModelProvider) {
        logger.warn(`[Router] ⚠️ Provider ${provider.id} is sick.`);
        provider.status = 'sick';
        setTimeout(() => { provider.status = 'healthy'; }, 60000);
    }

    private markAsBusy(provider: ModelProvider, cooldownMs: number = 20000) {
        logger.warn(`[Router] ⏳ Provider ${provider.id} rate limited.`);
        provider.status = 'busy';
        provider.busyUntil = Date.now() + cooldownMs;
    }

    // 修改点 1: 增加 tools 参数，返回完整对象
    async chat(messages: any[], tools?: any[]): Promise<any> {
        const MAX_RETRIES = 5;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            const provider = this.getHealthyProvider();
            
            if (!provider) {
                const anyBusy = this.pool.some(p => p.status === 'busy');
                if (anyBusy) throw new Error("🔥 All providers are busy. Please wait.");
                throw new Error("🔥 All providers are down!");
            }

            try {
                logger.info(`[Router] 🔄 Attempt ${attempt} using ${provider.id}...`);
                return await this.callProvider(provider, messages, tools);
            } catch (error: any) {
                logger.error(`[Router] ❌ Failed: ${error.message}`);
                lastError = error;
                if (error.message.includes('RATE_LIMIT')) this.markAsBusy(provider);
                else this.markAsSick(provider);
            }
        }
        throw lastError;
    }

    // 新增: 流式对话方法
    async *chatStream(messages: any[], tools?: any[]): AsyncGenerator<string, void, unknown> {
        const MAX_RETRIES = 5;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            const provider = this.getHealthyProvider();
            
            if (!provider) {
                const anyBusy = this.pool.some(p => p.status === 'busy');
                if (anyBusy) throw new Error("🔥 All providers are busy.");
                throw new Error("🔥 All providers are down!");
            }

            try {
                logger.info(`[Router] 🔄 Stream Attempt ${attempt} using ${provider.id}...`);
                // 调用流式接口
                yield* this.callProviderStream(provider, messages, tools);
                return;
            } catch (error: any) {
                logger.error(`[Router] ❌ Stream Failed: ${error.message}`);
                lastError = error;
                if (error.message.includes('RATE_LIMIT')) this.markAsBusy(provider);
                else this.markAsSick(provider);
            }
        }
        throw lastError;
    }

    private async *callProviderStream(provider: ModelProvider, messages: any[], tools?: any[]): AsyncGenerator<string, void, unknown> {
        const url = `${provider.baseUrl.replace(/\/+$/, '')}/chat/completions`;
        const payload: any = {
            model: provider.modelName,
            messages: messages,
            stream: true // 开启流式
        };
        if (tools && tools.length > 0) payload.tools = tools;

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (res.status === 429) throw new Error(`RATE_LIMIT`);
        if (!res.ok) throw new Error(`API Error ${res.status}`);
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ""; // 保留未完整的行

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data: ")) continue;
                const dataStr = trimmed.slice(6);
                if (dataStr === "[DONE]") return;

                try {
                    const json = JSON.parse(dataStr);
                    const content = json.choices[0]?.delta?.content || "";
                    if (content) yield content;
                } catch (e) {
                    // Ignore parse errors for partial chunks
                }
            }
        }
    }

    // 修改点 2: 传递 tools
    private async callProvider(provider: ModelProvider, messages: any[], tools?: any[]): Promise<any> {
        const url = `${provider.baseUrl.replace(/\/+$/, '')}/chat/completions`;
        
        const payload: any = {
            model: provider.modelName,
            messages: messages,
            stream: false
        };

        if (tools && tools.length > 0) {
            payload.tools = tools;
        }

        logger.debug(`[API Request] URL: ${url}`);
        // 不要打印完整的 payload，因为可能有敏感信息或太长，只打印关键信息
        logger.debug(`[API Request] Model: ${provider.modelName}, MsgCount: ${messages.length}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时

        try {
            const start = Date.now();
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${provider.apiKey}`
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            const duration = Date.now() - start;
            logger.debug(`[API Response] Status: ${res.status}, Time: ${duration}ms`);

            if (res.status === 429) throw new Error(`RATE_LIMIT`);
            if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`);

            const data: any = await res.json();
            return data.choices[0]?.message;
        } catch (err: any) {
             if (err.name === 'AbortError') {
                throw new Error(`Request timeout (60s)`);
            }
            throw err;
        } finally {
            clearTimeout(timeoutId);
        }
    }
}
