export interface GraphNode {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
}

export interface GraphEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  weight: number;
  blocked: boolean;
  bidirectional: boolean;
}

export interface CampusGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface OptimalRoute {
  nodeIds: string[];
  edges: GraphEdge[];
  totalWeight: number;
  distanceMeters: number;
}

export type GraphEditMode = 'none' | 'addNode' | 'addEdge' | 'editEdge';
