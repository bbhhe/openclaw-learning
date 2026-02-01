import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModelRouter } from './router';
import { modelPool } from './config';

// Mock global fetch
global.fetch = vi.fn();

describe('ModelRouter', () => {
    let router: ModelRouter;

    beforeEach(() => {
        vi.resetAllMocks();
        // Reset pool status
        modelPool.forEach(p => {
            p.status = 'healthy';
            p.busyUntil = undefined;
        });
        router = new ModelRouter();
    });

    it('should call the first healthy provider', async () => {
        // Mock success response
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ choices: [{ message: { content: 'Hello' } }] })
        } as Response);

        const result = await router.chat([{ role: 'user', content: 'Hi' }]);
        
        expect(result.content).toBe('Hello');
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should failover to next provider on error', async () => {
        // First call fails (500)
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: false,
            status: 500,
            text: async () => 'Server Error'
        } as Response);

        // Second call succeeds
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ choices: [{ message: { content: 'Recovered' } }] })
        } as Response);

        const result = await router.chat([{ role: 'user', content: 'Hi' }]);
        
        expect(result.content).toBe('Recovered');
        expect(fetch).toHaveBeenCalledTimes(2);
        // First provider should be marked sick
        expect(modelPool[0].status).toBe('sick');
    });

    it('should handle rate limits (429)', async () => {
        // First call 429
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: false,
            status: 429,
            text: async () => 'Rate Limit'
        } as Response);

        // Second call succeeds
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ choices: [{ message: { content: 'OK' } }] })
        } as Response);

        await router.chat([{ role: 'user', content: 'Hi' }]);
        
        // First provider should be marked busy
        expect(modelPool[0].status).toBe('busy');
        expect(modelPool[0].busyUntil).toBeDefined();
    });
});
