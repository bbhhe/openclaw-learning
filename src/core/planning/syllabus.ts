import fs from 'fs';
import { UserProfile } from '../types/profile';
import { KnowledgeGraph, KnowledgeNode } from '../types/knowledge';

export interface SyllabusModule {
  id: string;
  title: string;
  description: string;
}

export interface Syllabus {
  userId: string;
  modules: SyllabusModule[];
  createdAt: string;
}

/**
 * SyllabusGenerator
 * 数据驱动的大纲生成器
 */
export class SyllabusGenerator {
  /**
   * 根据知识图谱生成大纲
   */
  public generate(profile: UserProfile, graph: KnowledgeGraph): Syllabus {
    // 简单的依赖排序逻辑 (MVP 版：按原样或基础过滤)
    // 实际生产中可使用拓扑排序算法
    const nodes = graph.nodes;

    const modules: SyllabusModule[] = nodes.map(node => ({
      id: node.id,
      title: node.title,
      description: node.description
    }));

    // 根据学习风格添加修饰
    if (profile.cognitive_profile.learning_style === 'HANDS_ON') {
      modules.forEach(m => {
        m.title += ' (实战版)';
      });
    }

    return {
      userId: 'current-user',
      modules,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * 从文件加载知识库并生成大纲
   */
  public generateFromFile(profile: UserProfile, filePath: string): Syllabus {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Knowledge file not found: ${filePath}`);
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    const graph: KnowledgeGraph = JSON.parse(data);
    return this.generate(profile, graph);
  }
}
