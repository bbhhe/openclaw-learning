export interface ModelProvider {
    id: string;
    baseUrl: string;
    apiKey: string;
    modelName: string;
    status: 'healthy' | 'sick' | 'busy';
    busyUntil?: number;
}

// 示例配置
export const modelPool: ModelProvider[] = [
    { 
        id: 'primary-example', 
        baseUrl: 'https://api.openai.com/v1', 
        apiKey: 'sk-your-key-here', 
        modelName: 'gpt-3.5-turbo', 
        status: 'healthy' 
    }
];
