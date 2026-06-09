import * as SecureStore from 'expo-secure-store';
import { expressClient } from '@/services/express/api-client';
import { mapSupabaseError } from '@/core/errors/app-error';
import type { BusRoute, BusStop, BusLocation } from '../domain/route.entity';
import type { IBusRepository } from '../domain/bus.repository';
import { isDevMode } from '@/core/config/env';
import { MockData } from '@/core/dev/mock-services';

const AUTH_TOKEN_KEY = 'esfotgo_jwt_token';

export class ExpressBusRepository implements IBusRepository {
  private async token(): Promise<string | null> {
    try { return SecureStore.getItemAsync(AUTH_TOKEN_KEY); } catch { return null; }
  }

  async getRoutes(): Promise<BusRoute[]> {
    if (isDevMode()) return MockData.getBusRoutes();
    const { data, error } = await expressClient.get<Record<string, unknown>[]>('/bus/rutas');
    if (error) return [];
    return (data ?? []).map(this.mapRoute);
  }

  async getAllRoutes(): Promise<BusRoute[]> {
    if (isDevMode()) return MockData.getBusRoutes();
    const { data, error } = await expressClient.get<Record<string, unknown>[]>('/admin/bus/rutas');
    if (error) return [];
    return (data ?? []).map(this.mapRoute);
  }

  async getRouteStops(routeId: string): Promise<BusStop[]> {
    if (isDevMode()) return MockData.getBusStops(routeId);
    const { data, error } = await expressClient.get<Record<string, unknown>[]>(`/bus/paradas/${routeId}`);
    if (error) return [];
    return (data ?? []).map(this.mapStop);
  }

  async getBusLocations(routeId: string): Promise<BusLocation[]> {
    if (isDevMode()) return MockData.getBusLocations(routeId);
    const { data, error } = await expressClient.get<Record<string, unknown>[]>(`/bus/posiciones/${routeId}`);
    if (error) return [];
    return (data ?? []).map(this.mapLocation);
  }

  async createRoute(input: Omit<BusRoute, 'id' | 'createdAt'>): Promise<BusRoute> {
    if (isDevMode()) return { ...input, id: `mock-${Date.now()}`, createdAt: new Date().toISOString() };
    const t = await this.token();
    const { data, error } = await expressClient.post<Record<string, unknown>>('/admin/bus/rutas', {
      nombre: input.name, descripcion: input.description, color: input.color, activo: input.isActive,
    }, t);
    if (error) throw mapSupabaseError(new Error(error));
    return this.mapRoute(data!);
  }

  async updateRoute(id: string, input: Partial<BusRoute>): Promise<BusRoute> {
    if (isDevMode()) {
      const routes = await MockData.getBusRoutes();
      const found = routes.find((r) => r.id === id);
      if (!found) throw new Error('Ruta no encontrada');
      return { ...found, ...input, id: found.id, createdAt: found.createdAt };
    }
    const t = await this.token();
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.nombre = input.name;
    if (input.description !== undefined) payload.descripcion = input.description;
    if (input.color !== undefined) payload.color = input.color;
    if (input.isActive !== undefined) payload.activo = input.isActive;
    const { data, error } = await expressClient.put<Record<string, unknown>>(`/admin/bus/rutas/${id}`, payload, t);
    if (error) throw mapSupabaseError(new Error(error));
    return this.mapRoute(data!);
  }

  async deleteRoute(id: string): Promise<void> {
    if (isDevMode()) return;
    const t = await this.token();
    const { error } = await expressClient.delete(`/admin/bus/rutas/${id}`, t);
    if (error) throw mapSupabaseError(new Error(error));
  }

  async createStop(input: Omit<BusStop, 'id' | 'createdAt'>): Promise<BusStop> {
    if (isDevMode()) return { ...input, id: `mock-${Date.now()}`, createdAt: new Date().toISOString() };
    const t = await this.token();
    const { data, error } = await expressClient.post<Record<string, unknown>>(`/admin/bus/paradas`, {
      ruta_id: input.routeId, nombre: input.name, latitud: input.latitude, longitud: input.longitude, orden: input.stopOrder,
    }, t);
    if (error) throw mapSupabaseError(new Error(error));
    return this.mapStop(data!);
  }

  async updateStop(id: string, input: Partial<BusStop>): Promise<BusStop> {
    if (isDevMode()) return { routeId: '', name: '', latitude: 0, longitude: 0, stopOrder: 0, ...input, id, createdAt: new Date().toISOString() };
    const t = await this.token();
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.nombre = input.name;
    if (input.latitude !== undefined) payload.latitud = input.latitude;
    if (input.longitude !== undefined) payload.longitud = input.longitude;
    if (input.stopOrder !== undefined) payload.orden = input.stopOrder;
    const { data, error } = await expressClient.put<Record<string, unknown>>(`/admin/bus/paradas/${id}`, payload, t);
    if (error) throw mapSupabaseError(new Error(error));
    return this.mapStop(data!);
  }

  async deleteStop(id: string): Promise<void> {
    if (isDevMode()) return;
    const t = await this.token();
    const { error } = await expressClient.delete(`/admin/bus/paradas/${id}`, t);
    if (error) throw mapSupabaseError(new Error(error));
  }

  private mapRoute(row: Record<string, unknown>): BusRoute {
    return {
      id: (row._id as string) ?? (row.id as string) ?? '',
      name: (row.nombre as string) ?? (row.name as string) ?? '',
      description: (row.descripcion as string) ?? (row.description as string) ?? null,
      color: (row.color as string) ?? '#1B6BB0',
      isActive: ((row.activo as boolean) ?? (row.isActive as boolean) ?? true),
      createdAt: (row.created_at as string) ?? (row.createdAt as string) ?? new Date().toISOString(),
    };
  }

  private mapStop(row: Record<string, unknown>): BusStop {
    return {
      id: (row._id as string) ?? (row.id as string) ?? '',
      routeId: (row.ruta_id as string) ?? (row.route_id as string) ?? (row.routeId as string) ?? '',
      name: (row.nombre as string) ?? (row.name as string) ?? '',
      latitude: (row.latitud as number) ?? (row.latitude as number) ?? 0,
      longitude: (row.longitud as number) ?? (row.longitude as number) ?? 0,
      stopOrder: (row.orden as number) ?? (row.stop_order as number) ?? (row.stopOrder as number) ?? 0,
      createdAt: (row.created_at as string) ?? (row.createdAt as string) ?? new Date().toISOString(),
    };
  }

  private mapLocation(row: Record<string, unknown>): BusLocation {
    return {
      id: (row._id as string) ?? (row.id as string) ?? '',
      routeId: (row.ruta_id as string) ?? (row.route_id as string) ?? (row.routeId as string) ?? '',
      busId: (row.bus_id as string) ?? (row.busId as string) ?? '',
      latitude: (row.latitud as number) ?? (row.latitude as number) ?? 0,
      longitude: (row.longitud as number) ?? (row.longitude as number) ?? 0,
      heading: (row.heading as number) ?? 0,
      updatedAt: (row.updated_at as string) ?? (row.updatedAt as string) ?? new Date().toISOString(),
    };
  }
}
