import { describe, it, expect } from 'vitest';
import { getTutorPrompt } from '../prompts/tutor';
import { TutorController } from '../teaching/tutor';

describe('Tutor Core', () => {
  it('should generate a tutor prompt with topic', () => {
    const topic = 'Java 内存模型';
    const prompt = getTutorPrompt(topic);
    expect(prompt).toContain('费曼学习法');
    expect(prompt).toContain(topic);
  });

  it('should start a module via controller', () => {
    const controller = new TutorController();
    const mockModule = { id: 'm1', title: 'OOP', description: 'desc' };
    const intro = controller.startModule(mockModule);
    expect(intro).toContain('OOP');
    expect(intro).toContain('导师已就位');
  });

  it('should evaluate user feedback', () => {
    const controller = new TutorController();
    const resultLong = controller.evaluateFeedback('我觉得对象就像是一个模具，可以生产出很多饼干。');
    expect(resultLong.understood).toBe(true);

    const resultShort = controller.evaluateFeedback('不懂');
    expect(resultShort.understood).toBe(false);
  });
});
