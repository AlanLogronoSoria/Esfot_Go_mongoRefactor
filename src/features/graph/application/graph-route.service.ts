import type { GeoCoordinate } from '@/features/map/domain/coordinates';
import type { CampusGraph, OptimalRoute } from '@/features/graph/domain/graph.entity';
import { haversineMeters } from '@/features/graph/application/graph.hooks';

export interface GraphRouteResult {
  waypoints: GeoCoordinate[];
  distance: number;
  etaMinutes: number;
  nodeCount: number;
}

// ─── Route cache ────────────────────────────────────────────

const routeCache = new Map<string, GraphRouteResult>();
const ROUTE_CACHE_MAX = 20;

function routeCacheKey(fromId: string, toId: string): string {
  return fromId < toId ? `${fromId}→${toId}` : `${toId}→${fromId}`;
}

export function getCachedRoute(fromId: string, toId: string): GraphRouteResult | null {
  return routeCache.get(routeCacheKey(fromId, toId)) ?? null;
}

function setCachedRoute(fromId: string, toId: string, result: GraphRouteResult): void {
  if (routeCache.size >= ROUTE_CACHE_MAX) {
    const first = routeCache.keys().next().value;
    if (first) routeCache.delete(first);
  }
  routeCache.set(routeCacheKey(fromId, toId), result);
}

export function clearRouteCache(): void {
  routeCache.clear();
}

// ─── Nearest node ───────────────────────────────────────────

export function findNearestNode(
  graph: CampusGraph,
  coord: GeoCoordinate,
  maxDistanceM: number = 200
): string | null {
  let bestId: string | null = null;
  let bestDist = Infinity;

  for (const node of graph.nodes) {
    const d = haversineMeters(coord.latitude, coord.longitude, node.latitude, node.longitude);
    if (d < bestDist && d <= maxDistanceM) {
      bestDist = d;
      bestId = node.id;
    }
  }

  return bestId;
}

// ─── Route conversion ──────────────────────────────────────

export function graphRouteToWaypoints(
  graph: CampusGraph,
  route: OptimalRoute,
  fromId?: string,
  toId?: string
): GraphRouteResult {
  if (fromId && toId) {
    const cached = getCachedRoute(fromId, toId);
    if (cached) return cached;
  }

  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  const waypoints: GeoCoordinate[] = route.nodeIds
    .map((id) => {
      const node = nodeMap.get(id);
      return node ? { latitude: node.latitude, longitude: node.longitude } : null;
    })
    .filter((w): w is GeoCoordinate => w !== null);

  const avgWalkingSpeedKmh = 5;
  const etaMinutes = (route.distanceMeters / 1000 / avgWalkingSpeedKmh) * 60;

  const result: GraphRouteResult = {
    waypoints,
    distance: Math.round(route.distanceMeters),
    etaMinutes: Math.round(etaMinutes),
    nodeCount: route.nodeIds.length,
  };

  if (fromId && toId) setCachedRoute(fromId, toId, result);
  return result;
}

export function formatGraphRouteInfo(result: GraphRouteResult): {
  distanceLabel: string;
  etaLabel: string;
  directionLabel: string;
} {
  const meters = result.distance;
  const distanceLabel = meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1)} km`;
  const mins = result.etaMinutes;
  const etaLabel = mins < 1 ? '< 1 min' : mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${mins % 60} min`;
  return { distanceLabel, etaLabel, directionLabel: `🛤️ ${result.nodeCount} nodos` };
}
