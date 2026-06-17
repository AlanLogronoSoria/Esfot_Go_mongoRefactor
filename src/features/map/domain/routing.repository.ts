import type { GeoCoordinate } from './coordinates';

export interface RoutingResult {
  waypoints: GeoCoordinate[];
  distance: number;
  duration: number;
}

export interface IRoutingRepository {
  getRoute(origin: GeoCoordinate, destination: GeoCoordinate): Promise<RoutingResult>;
}
