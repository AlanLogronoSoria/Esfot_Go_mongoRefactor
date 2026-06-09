import type { CampusGraph, GraphEdge, OptimalRoute } from './graph.entity';

export function dijkstra(
  graph: CampusGraph,
  fromId: string,
  toId: string
): OptimalRoute | null {
  const { nodes, edges } = graph;

  const adj = new Map<string, { neighborId: string; edge: GraphEdge }[]>();
  for (const node of nodes) adj.set(node.id, []);

  for (const edge of edges) {
    if (edge.blocked) continue;
    adj.get(edge.fromNodeId)?.push({ neighborId: edge.toNodeId, edge });
    if (edge.bidirectional) {
      adj.get(edge.toNodeId)?.push({ neighborId: edge.fromNodeId, edge });
    }
  }

  const dist = new Map<string, number>();
  const prev = new Map<string, { nodeId: string; edge: GraphEdge } | null>();

  for (const node of nodes) {
    dist.set(node.id, Infinity);
    prev.set(node.id, null);
  }
  dist.set(fromId, 0);

  const unvisited = new Set(nodes.map((n) => n.id));

  while (unvisited.size > 0) {
    let u: string | null = null;
    let minDist = Infinity;
    for (const id of unvisited) {
      const d = dist.get(id) ?? Infinity;
      if (d < minDist) { minDist = d; u = id; }
    }

    if (!u || minDist === Infinity) break;
    if (u === toId) break;

    unvisited.delete(u);

    for (const { neighborId, edge } of adj.get(u) ?? []) {
      if (!unvisited.has(neighborId)) continue;
      const alt = (dist.get(u) ?? Infinity) + edge.weight;
      if (alt < (dist.get(neighborId) ?? Infinity)) {
        dist.set(neighborId, alt);
        prev.set(neighborId, { nodeId: u, edge });
      }
    }
  }

  if ((dist.get(toId) ?? Infinity) === Infinity) return null;

  const nodeIds: string[] = [];
  const usedEdges: GraphEdge[] = [];
  let current: string = toId;

  while (current !== fromId) {
    nodeIds.unshift(current);
    const p = prev.get(current);
    if (!p) return null;
    usedEdges.unshift(p.edge);
    current = p.nodeId;
  }
  nodeIds.unshift(fromId);

  return {
    nodeIds,
    edges: usedEdges,
    totalWeight: dist.get(toId) ?? 0,
    distanceMeters: dist.get(toId) ?? 0,
  };
}
