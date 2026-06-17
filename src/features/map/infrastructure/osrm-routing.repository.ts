import type { GeoCoordinate } from '../domain/coordinates';
import type { IRoutingRepository, RoutingResult } from '../domain/routing.repository';

const OSRM_BASE_URL = 'https://router.project-osrm.org';

export class OsrmRoutingRepository implements IRoutingRepository {
  async getRoute(origin: GeoCoordinate, destination: GeoCoordinate): Promise<RoutingResult> {
    const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
    const url = `${OSRM_BASE_URL}/route/v1/walking/${coords}?overview=full&geometries=geojson`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`OSRM error: HTTP ${res.status}`);
    }

    const json = await res.json();
    const route = json.routes?.[0];
    if (!route || !route.geometry?.coordinates) {
      throw new Error('OSRM: no se encontró ruta');
    }

    const waypoints: GeoCoordinate[] = route.geometry.coordinates.map(
      ([lon, lat]: [number, number]) => ({ latitude: lat, longitude: lon }),
    );

    return {
      waypoints,
      distance: Math.round(route.distance),
      duration: Math.round(route.duration),
    };
  }
}
