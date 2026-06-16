import type { CampusGraph, GraphEdge, GraphNode } from './graph.entity';

export interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  bidirectionalCount: number;
  oneWayCount: number;
  blockedCount: number;
  isolatedNodes: string[];
  danglingEdges: { edgeId: string; missingNodeId: string }[];
  selfLoops: string[];
}

export function validateGraphIntegrity(graph: CampusGraph): GraphStats {
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  const isolatedNodes: string[] = [];
  const danglingEdges: { edgeId: string; missingNodeId: string }[] = [];
  const selfLoops: string[] = [];

  let bidirectionalCount = 0;
  let oneWayCount = 0;
  let blockedCount = 0;

  const connectedNodes = new Set<string>();

  for (const edge of graph.edges) {
    if (edge.blocked) blockedCount++;

    if (edge.bidirectional) bidirectionalCount++;
    else oneWayCount++;

    if (edge.fromNodeId === edge.toNodeId) {
      selfLoops.push(edge.id);
    }

    if (!nodeIds.has(edge.fromNodeId)) {
      danglingEdges.push({ edgeId: edge.id, missingNodeId: edge.fromNodeId });
    } else {
      connectedNodes.add(edge.fromNodeId);
    }

    if (!nodeIds.has(edge.toNodeId)) {
      danglingEdges.push({ edgeId: edge.id, missingNodeId: edge.toNodeId });
    } else {
      connectedNodes.add(edge.toNodeId);
    }
  }

  for (const nodeId of nodeIds) {
    if (!connectedNodes.has(nodeId)) {
      isolatedNodes.push(nodeId);
    }
  }

  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    bidirectionalCount,
    oneWayCount,
    blockedCount,
    isolatedNodes,
    danglingEdges,
    selfLoops,
  };
}

export function logGraphStats(graph: CampusGraph): void {
  const stats = validateGraphIntegrity(graph);
  console.log('[Graph] Stats:',
    `${stats.nodeCount} nodos,`,
    `${stats.edgeCount} aristas (${stats.bidirectionalCount} bidir, ${stats.oneWayCount} unidir, ${stats.blockedCount} bloq)`);

  if (stats.isolatedNodes.length > 0) {
    console.log(`[Graph] Nodos aislados: ${stats.isolatedNodes.length}`);
  }
  if (stats.danglingEdges.length > 0) {
    console.log(`[Graph] Aristas huérfanas: ${stats.danglingEdges.length}`);
    for (const d of stats.danglingEdges) {
      console.log(`[Graph]   Arista ${d.edgeId} → nodo ${d.missingNodeId} no existe`);
    }
  }
  if (stats.selfLoops.length > 0) {
    console.log(`[Graph] Self-loops: ${stats.selfLoops.length}`);
  }
}

export function validateEdgeNodes(
  graph: CampusGraph,
  fromNodeId: string,
  toNodeId: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const nodeIds = new Set(graph.nodes.map((n) => n.id));

  if (!nodeIds.has(fromNodeId)) {
    errors.push(`Nodo origen "${fromNodeId}" no existe`);
  }
  if (!nodeIds.has(toNodeId)) {
    errors.push(`Nodo destino "${toNodeId}" no existe`);
  }
  if (fromNodeId === toNodeId) {
    errors.push('Los nodos origen y destino no pueden ser el mismo');
  }

  return { valid: errors.length === 0, errors };
}
