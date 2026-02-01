import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Scheduler } from './scheduler';

describe('Scheduler', () => {
    let scheduler: Scheduler;

    beforeEach(() => {
        vi.useFakeTimers();
        scheduler = new Scheduler();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should add a task and return an ID', () => {
        const id = scheduler.addTask('Test Task', 10);
        expect(id).toBeDefined();
        expect(typeof id).toBe('string');
    });

    it('should trigger task after delay', () => {
        const callback = vi.fn();
        scheduler.on('trigger', callback);

        scheduler.addTask('Wake up', 5);

        // Fast-forward 4.9s - should not trigger yet
        vi.advanceTimersByTime(4900);
        expect(callback).not.toHaveBeenCalled();

        // Fast-forward past 5s - should trigger
        vi.advanceTimersByTime(200);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(expect.objectContaining({
            content: 'Wake up'
        }));
    });

    it('should handle multiple tasks in order', () => {
        const callback = vi.fn();
        scheduler.on('trigger', callback);

        scheduler.addTask('Task 1', 2);
        scheduler.addTask('Task 2', 1); // Earlier

        // Advance 1.5s -> Task 2 triggers
        vi.advanceTimersByTime(1500);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenLastCalledWith(expect.objectContaining({ content: 'Task 2' }));

        // Advance another 1s -> Task 1 triggers
        vi.advanceTimersByTime(1000);
        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenLastCalledWith(expect.objectContaining({ content: 'Task 1' }));
    });
});
