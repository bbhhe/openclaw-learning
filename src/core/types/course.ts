/**
 * @fileoverview Defines the data structures for the Course and Knowledge Graph system.
 * Based on architectural requirement: "Course & Progress (Generic DAG)".
 */

/**
 * Represents a single atomic unit of knowledge within the course graph.
 * This is a node in the Directed Acyclic Graph (DAG).
 */
export interface KnowledgeNode {
  /** Unique identifier for the node */
  id: string;

  /** Human-readable title of the knowledge unit */
  title: string;

  /** detailed description of what this node covers (optional) */
  description?: string;

  /** The type of learning activity or content */
  type: 'concept' | 'practice' | 'project';

  /** IDs of prerequisite nodes that must be completed before this one */
  dependencies: string[];

  /** Estimated time to complete in minutes (optional) */
  estimatedDuration?: number;
}

/**
 * Metadata describing the categorization and difficulty of a course.
 */
export interface CourseMetadata {
  /** The broad domain of the course */
  category: 'coding' | 'theory' | 'creative';

  /** The intended difficulty level */
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  /** Arbitrary tags for filtering or searching */
  tags: string[];
}

/**
 * Represents the entire curriculum or domain map.
 * Contains the graph structure via the list of nodes and their dependencies.
 */
export interface Course {
  /** Unique identifier for the course */
  id: string;

  /** Display title of the course */
  title: string;

  /** Categorization and classification metadata */
  metadata: CourseMetadata;

  /** List of all nodes contained in this course's graph */
  nodes: KnowledgeNode[];
}

/**
 * Possible statuses for a node relative to a user's progress.
 */
export type NodeStatus = 'locked' | 'available' | 'in-progress' | 'completed';

/**
 * Tracks a specific user's traversal and progress through a course graph.
 */
export interface CourseState {
  /** ID of the course this state belongs to */
  courseId: string;

  /** The ID of the node currently being focused on (null if none selected) */
  currentNodeId: string | null;

  /** List of IDs of nodes that have been fully completed */
  completedNodes: string[];

  /** Map of node IDs to their current availability status for the user */
  nodeStatus: Record<string, NodeStatus>;

  /** Timestamp when the user started the course */
  startedAt: Date;

  /** Timestamp of the last user interaction with this course */
  lastActiveAt: Date;
}
