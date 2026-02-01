import { describe, it, expect, afterEach } from 'vitest';
import { ProcessManager } from './process-manager';

describe('ProcessManager', () => {
    let pm: ProcessManager;
    let activeIds: string[] = [];

    afterEach(() => {
        // Cleanup
        if (pm) {
            activeIds.forEach(id => pm.kill(id));
        }
        activeIds = [];
    });

    it('should start a process and capture output', async () => {
        pm = new ProcessManager();
        // echo hello
        const id = pm.start('echo "Hello World"');
        activeIds.push(id);

        expect(id).toBeDefined();

        // Wait for output
        await new Promise(resolve => setTimeout(resolve, 500));

        const log = pm.getLog(id);
        expect(log).toContain('Hello World');
    });

    it('should support writing to stdin', async () => {
        pm = new ProcessManager();
        // cat command simply echoes stdin to stdout
        const id = pm.start('cat'); 
        activeIds.push(id);

        // Write to stdin
        pm.write(id, 'Input Data\n');

        // Wait for echo
        await new Promise(resolve => setTimeout(resolve, 500));

        const log = pm.getLog(id);
        expect(log).toContain('Input Data');
    });

    it('should list active processes', async () => {
        pm = new ProcessManager();
        const id = pm.start('sleep 1');
        activeIds.push(id);

        const list = pm.list();
        expect(list).toHaveLength(1);
        expect(list[0].id).toBe(id);
    });
    
    it('should kill a process', async () => {
        pm = new ProcessManager();
        const id = pm.start('sleep 10');
        activeIds.push(id);
        
        pm.kill(id);
        
        const list = pm.list();
        expect(list).toHaveLength(0);
    });
});
