import type { BusRoute, BusStop, BusLocation } from './route.entity';

export interface IBusRepository {
  getRoutes(): Promise<BusRoute[]>;
  getAllRoutes(): Promise<BusRoute[]>;
  getRouteStops(routeId: string): Promise<BusStop[]>;
  getBusLocations(routeId: string): Promise<BusLocation[]>;
  createRoute(input: Omit<BusRoute, 'id' | 'createdAt'>): Promise<BusRoute>;
  updateRoute(id: string, input: Partial<BusRoute>): Promise<BusRoute>;
  deleteRoute(id: string): Promise<void>;
  createStop(input: Omit<BusStop, 'id' | 'createdAt'>): Promise<BusStop>;
  updateStop(id: string, input: Partial<BusStop>): Promise<BusStop>;
  deleteStop(id: string): Promise<void>;
}
