import { modelPool, ModelProvider } from './config';

export class ModelRouter {
    private pool: ModelProvider[] = modelPool;

    private getHealthyProvider(): ModelProvider | null {
        const now = Date.now();
        return this.pool.find(p => {
            if (p.status === 'healthy') return true;
            if (p.status === 'busy' && p.busyUntil && p.busyUntil <= now) {
                console.log(`[Router] 🔓 Provider ${p.id} rate limit reset!`);
                p.status = 'healthy';
                p.busyUntil = undefined;
                return true;
            }
            return false;
        }) || null;
    }

    private markAsSick(provider: ModelProvider) {
        console.warn(`[Router] ⚠️ Provider ${provider.id} is sick.`);
        provider.status = 'sick';
        setTimeout(() => { provider.status = 'healthy'; }, 60000);
    }

    private markAsBusy(provider: ModelProvider, cooldownMs: number = 20000) {
        console.warn(`[Router] ⏳ Provider ${provider.id} rate limited.`);
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
                console.log(`[Router] 🔄 Attempt ${attempt} using ${provider.id}...`);
                return await this.callProvider(provider, messages, tools);
            } catch (error: any) {
                console.error(`[Router] ❌ Failed: ${error.message}`);
                lastError = error;
                if (error.message.includes('RATE_LIMIT')) this.markAsBusy(provider);
                else this.markAsSick(provider);
            }
        }
        throw lastError;
    }

    // 修改点 2: 传递 tools
    private async callProvider(provider: ModelProvider, messages: any[], tools?: any[]): Promise<any> {
        const url = `${provider.baseUrl.replace(/\/+$/, '')}/chat/completions`;
        
        const payload: any = {
            model: provider.modelName,
            messages: messages,
            stream: false
        };

        // 如果有工具，就带上
        if (tools && tools.length > 0) {
            payload.tools = tools;
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (res.status === 429) throw new Error(`RATE_LIMIT`);
        if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`);

        const data: any = await res.json();
        // 返回完整的 message 对象 (content + tool_calls)
        return data.choices[0]?.message;
    }
}
