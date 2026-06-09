import { expressClient } from '@/services/express/api-client';
import { AppError, NotFoundError } from '@/core/errors/app-error';
import type { CampusLocation } from '../domain/location.entity';
import type { ILocationRepository } from '../domain/location.repository';

// ─── DTO ────────────────────────────────────────────────────

interface LocationDto {
  _id?: string; id?: string;
  nombre?: string; name?: string;
  descripcion?: string; description?: string;
  categoria?: string; category?: string;
  latitud?: number; latitude?: number;
  longitud?: number; longitude?: number;
  imagen?: string; image_url?: string; imageUrl?: string;
  created_at?: string; createdAt?: string;
}

// ─── Mapper ─────────────────────────────────────────────────

function mapDtoToLocation(dto: LocationDto): CampusLocation {
  return {
    id: dto._id ?? dto.id ?? '',
    name: dto.nombre ?? dto.name ?? '',
    description: dto.descripcion ?? dto.description ?? null,
    category: dto.categoria ?? dto.category ?? 'otro',
    latitude: dto.latitud ?? dto.latitude ?? 0,
    longitude: dto.longitud ?? dto.longitude ?? 0,
    imageUrl: dto.imagen ?? dto.image_url ?? dto.imageUrl ?? null,
    createdAt: dto.created_at ?? dto.createdAt ?? new Date().toISOString(),
  };
}

// ─── Repository ─────────────────────────────────────────────

export class ExpressLocationRepository implements ILocationRepository {
  async getCampusLocations(category?: string): Promise<CampusLocation[]> {
    const path = category ? `/mapa/categoria/${category}` : '/mapa/ubicaciones';
    const { data, error } = await expressClient.get<LocationDto[]>(path);
    if (error) throw new AppError(error, 'API_ERROR');
    return (data ?? []).map(mapDtoToLocation);
  }

  async getLocationById(id: string): Promise<CampusLocation> {
    const { data, error } = await expressClient.get<LocationDto>(`/mapa/ubicacion/${id}`);
    if (error) throw new AppError(error, 'API_ERROR');
    if (!data) throw new NotFoundError('Ubicación no encontrada');
    return mapDtoToLocation(data);
  }
}
