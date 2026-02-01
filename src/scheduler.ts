import { EventEmitter } from 'events';

export interface Task {
    id: string;
    dueTime: number; // Timestamp
    content: string;
}

export class Scheduler extends EventEmitter {
    private tasks: Task[] = [];
    private timer: NodeJS.Timeout | null = null;

    constructor() {
        super();
    }

    // Add a new task
    addTask(content: string, delaySeconds: number): string {
        const id = Math.random().toString(36).substring(7);
        const dueTime = Date.now() + delaySeconds * 1000;
        
        const task: Task = { id, dueTime, content };
        this.tasks.push(task);
        
        console.log(`[Scheduler] Added task '${content}' due at ${new Date(dueTime).toLocaleTimeString()}`);
        
        this.scheduleNextCheck();
        return id;
    }

    // The "Hotel Receptionist" Logic
    private scheduleNextCheck() {
        if (this.timer) clearTimeout(this.timer);
        if (this.tasks.length === 0) return;

        // 1. Find the earliest task
        this.tasks.sort((a, b) => a.dueTime - b.dueTime);
        const nextTask = this.tasks[0];
        const now = Date.now();
        
        // 2. Calculate delay (at least 0ms)
        const delay = Math.max(0, nextTask.dueTime - now);

        // 3. Set the single timer
        console.log(`[Scheduler] Next check in ${(delay/1000).toFixed(1)}s for task ${nextTask.id}`);
        this.timer = setTimeout(() => {
            this.runDueTasks();
        }, delay);
    }

    private runDueTasks() {
        const now = Date.now();
        
        // Filter tasks that are due
        const dueTasks = this.tasks.filter(t => t.dueTime <= now);
        const pendingTasks = this.tasks.filter(t => t.dueTime > now);

        // Execute callbacks
        dueTasks.forEach(task => {
            console.log(`[Scheduler] ⏰ Triggering task: ${task.content}`);
            this.emit('trigger', task);
        });

        // Update list and reschedule
        this.tasks = pendingTasks;
        this.scheduleNextCheck();
    }
}
