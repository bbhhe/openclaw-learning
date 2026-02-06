export interface KnowledgeNode {
  id: string;
  title: string;
  description: string;
  dependencies: string[];
  difficulty: number;
  estimatedMinutes: number;
  tags: string[];
}

export interface KnowledgeGraph {
  courseId: string;
  version: string;
  nodes: KnowledgeNode[];
}
