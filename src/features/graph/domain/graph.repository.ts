import type { CampusGraph, GraphEdge, GraphNode } from './graph.entity';

export interface IGraphRepository {
  getGraph(): Promise<CampusGraph>;
  upsertNode(node: Omit<GraphNode, 'id'> & { id?: string }): Promise<GraphNode>;
  deleteNode(id: string): Promise<void>;
  upsertEdge(edge: Omit<GraphEdge, 'id'> & { id?: string }): Promise<GraphEdge>;
  updateEdge(id: string, patch: Partial<GraphEdge>): Promise<GraphEdge>;
  deleteEdge(id: string): Promise<void>;
}
