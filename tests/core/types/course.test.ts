import { describe, it, expect } from 'vitest';
import {
  KnowledgeNode,
  CourseMetadata,
  Course,
  CourseState,
  NodeStatus
} from '../../../src/core/types/course';

describe('Course Type Definitions', () => {

  it('should create a valid KnowledgeNode', () => {
    const node: KnowledgeNode = {
      id: 'node-101',
      title: 'Intro to Variables',
      type: 'concept',
      dependencies: [],
      description: 'Learn about let and const',
      estimatedDuration: 15
    };

    expect(node.id).toBe('node-101');
    expect(node.type).toBe('concept');
    expect(node.dependencies).toEqual([]);
    expect(node.estimatedDuration).toBe(15);
  });

  it('should create a valid CourseMetadata', () => {
    const meta: CourseMetadata = {
      category: 'coding',
      difficulty: 'beginner',
      tags: ['js', 'basics']
    };

    expect(meta.category).toBe('coding');
    expect(meta.difficulty).toBe('beginner');
    expect(meta.tags).toContain('js');
  });

  it('should create a valid Course object', () => {
    const course: Course = {
      id: 'course-js-101',
      title: 'JavaScript Basics',
      metadata: {
        category: 'coding',
        difficulty: 'beginner',
        tags: ['web']
      },
      nodes: [
        {
          id: 'n1',
          title: 'Start',
          type: 'concept',
          dependencies: []
        }
      ]
    };

    expect(course.id).toBe('course-js-101');
    expect(course.nodes).toHaveLength(1);
    expect(course.metadata.category).toBe('coding');
  });

  it('should create a valid CourseState', () => {
    const now = new Date();
    const state: CourseState = {
      courseId: 'course-js-101',
      currentNodeId: 'n1',
      completedNodes: [],
      nodeStatus: {
        'n1': 'in-progress',
        'n2': 'locked'
      },
      startedAt: now,
      lastActiveAt: now
    };

    expect(state.courseId).toBe('course-js-101');
    expect(state.currentNodeId).toBe('n1');
    expect(state.nodeStatus['n2']).toBe('locked');
    expect(state.startedAt).toBeInstanceOf(Date);
  });
  
  it('should accept valid NodeStatus values', () => {
      const status1: NodeStatus = 'locked';
      const status2: NodeStatus = 'available';
      const status3: NodeStatus = 'in-progress';
      const status4: NodeStatus = 'completed';
      
      expect([status1, status2, status3, status4]).toHaveLength(4);
  });

});
