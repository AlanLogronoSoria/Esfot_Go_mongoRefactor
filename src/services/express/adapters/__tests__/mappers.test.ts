// ============================================================
// Adapter Layer Integration Tests
// Verifies MongoDB DTO ↔ TypeScript Entity mapping correctness
// ============================================================

import {
  mapUserDtoToUser,
  mapEventDtoToEvent,
  mapLocationDtoToCampusLocation,
  mapZoneDtoToZone,
  mapBusRouteDtoToBusRoute,
  mapBusStopDtoToBusStop,
  mapBusLocationDtoToBusLocation,
  mapGraphNodeDtoToGraphNode,
  mapGraphEdgeDtoToGraphEdge,
} from '@/services/express/adapters/mongo-mappers';
import {
  transformEventToDto,
  transformLocationToDto,
  transformZoneToDto,
  transformBusRouteToDto,
  transformBusStopToDto,
} from '@/services/express/adapters/mongo-transformers';
import type { UserDto, EventDto, LocationDto, ZoneDto, BusRouteDto, BusStopDto, BusLocationDto, GraphNodeDto, GraphEdgeDto } from '@/services/express/adapters/mongo-dtos';

// ─── User Mapper ────────────────────────────────────────────

describe('mapUserDtoToUser', () => {
  it('maps MongoDB fields to User entity', () => {
    const dto: UserDto = {
      _id: 'abc123',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@epn.edu.ec',
      telefono: '0991234567',
      rol: 'estudiante',
    };
    const user = mapUserDtoToUser(dto);
    expect(user.id).toBe('abc123');
    expect(user.fullName).toBe('Juan Pérez');
    expect(user.email).toBe('juan@epn.edu.ec');
    expect(user.phone).toBe('0991234567');
    expect(user.role).toBe('estudiante');
  });

  it('normalizes admin role to administrador', () => {
    const user = mapUserDtoToUser({ _id: 'x', email: 'a@b.com', rol: 'admin' });
    expect(user.role).toBe('administrador');
  });

  it('normalizes user role to estudiante', () => {
    const user = mapUserDtoToUser({ _id: 'x', email: 'a@b.com', rol: 'user' });
    expect(user.role).toBe('estudiante');
  });

  it('normalizes gestor role', () => {
    const user = mapUserDtoToUser({ _id: 'x', email: 'a@b.com', rol: 'gestor' });
    expect(user.role).toBe('gestor');
  });

  it('handles missing optional fields', () => {
    const user = mapUserDtoToUser({ _id: 'x', email: 'a@b.com' });
    expect(user.fullName).toBeNull();
    expect(user.phone).toBeNull();
    expect(user.avatarUrl).toBeNull();
  });

  it('defaults role to estudiante when undefined', () => {
    const user = mapUserDtoToUser({ _id: 'x', email: 'a@b.com' });
    expect(user.role).toBe('estudiante');
  });
});

// ─── Event Mapper ───────────────────────────────────────────

describe('mapEventDtoToEvent', () => {
  const dto: EventDto = {
    _id: 'evt-1',
    titulo: 'Feria Tech',
    descripcion: 'Evento tecnológico',
    ubicacion: 'Auditorio',
    categoria: 'tecnologico',
    fecha_inicio: '2026-06-15T09:00:00Z',
    fecha_fin: '2026-06-15T17:00:00Z',
    organizador: 'Depto TI',
    imagen: 'https://img.url/foto.jpg',
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  };

  it('maps MongoDB titulo to Event.title', () => {
    const event = mapEventDtoToEvent(dto);
    expect(event.title).toBe('Feria Tech');
  });

  it('maps descripcion to description', () => {
    expect(mapEventDtoToEvent(dto).description).toBe('Evento tecnológico');
  });

  it('maps ubicacion to location', () => {
    expect(mapEventDtoToEvent(dto).location).toBe('Auditorio');
  });

  it('maps fecha_inicio to startDate', () => {
    expect(mapEventDtoToEvent(dto).startDate).toBe('2026-06-15T09:00:00Z');
  });

  it('reads camelCase as fallback', () => {
    const event = mapEventDtoToEvent({ _id: 'x', title: 'Test', startDate: '2026-01-01' });
    expect(event.title).toBe('Test');
    expect(event.startDate).toBe('2026-01-01');
  });

  it('reads v1 schema (nombre/informacion/fecha)', () => {
    const event = mapEventDtoToEvent({ _id: 'x', nombre: 'Old', informacion: 'Desc', fecha: '2026-01-01' });
    expect(event.title).toBe('Old');
    expect(event.description).toBe('Desc');
    expect(event.startDate).toBe('2026-01-01');
  });
});

// ─── Location Mapper ────────────────────────────────────────

describe('mapLocationDtoToCampusLocation', () => {
  it('maps Spanish fields to English', () => {
    const dto: LocationDto = {
      _id: 'loc-1', nombre: 'Edificio ESFOT', descripcion: 'Principal',
      categoria: 'academico', latitud: -0.2105, longitud: -78.4895,
      imagen: 'https://img/foto.jpg', created_at: '2026-01-01',
    };
    const loc = mapLocationDtoToCampusLocation(dto);
    expect(loc.id).toBe('loc-1');
    expect(loc.name).toBe('Edificio ESFOT');
    expect(loc.category).toBe('academico');
    expect(loc.latitude).toBe(-0.2105);
    expect(loc.longitude).toBe(-78.4895);
    expect(loc.imageUrl).toBe('https://img/foto.jpg');
  });

  it('normalizes missing coordinates to 0', () => {
    const loc = mapLocationDtoToCampusLocation({});
    expect(loc.latitude).toBe(0);
    expect(loc.longitude).toBe(0);
  });

  it('defaults category to otro', () => {
    expect(mapLocationDtoToCampusLocation({}).category).toBe('otro');
  });
});

// ─── Zone Mapper ────────────────────────────────────────────

describe('mapZoneDtoToZone', () => {
  it('maps zone fields correctly', () => {
    const dto: ZoneDto = {
      _id: 'z-1', nombre: 'Zona Restringida',
      coordenadas: [{ latitude: -0.21, longitude: -78.49 }],
      fill_color: 'rgba(255,0,0,0.2)', stroke_color: '#FF0000',
      activo: true,
    };
    const zone = mapZoneDtoToZone(dto);
    expect(zone.name).toBe('Zona Restringida');
    expect(zone.coordinates).toHaveLength(1);
    expect(zone.fillColor).toBe('rgba(255,0,0,0.2)');
    expect(zone.isActive).toBe(true);
  });

  it('defaults fill/stroke colors', () => {
    const zone = mapZoneDtoToZone({});
    expect(zone.fillColor).toBe('rgba(200,16,46,0.2)');
    expect(zone.strokeColor).toBe('#C8102E');
    expect(zone.isActive).toBe(true);
  });
});

// ─── Bus Mappers ────────────────────────────────────────────

describe('Bus route/stop/location mappers', () => {
  it('maps bus route DTO', () => {
    const route = mapBusRouteDtoToBusRoute({ _id: 'r-1', nombre: 'Ruta Campus', color: '#1B6BB0', activo: true });
    expect(route.name).toBe('Ruta Campus');
    expect(route.isActive).toBe(true);
  });

  it('maps bus stop DTO', () => {
    const stop = mapBusStopDtoToBusStop({ _id: 's-1', ruta_id: 'r-1', nombre: 'Parada 1', latitud: -0.21, longitud: -78.49, orden: 1 });
    expect(stop.routeId).toBe('r-1');
    expect(stop.stopOrder).toBe(1);
  });

  it('maps bus location DTO', () => {
    const loc = mapBusLocationDtoToBusLocation({ _id: 'bl-1', ruta_id: 'r-1', bus_id: 'B001', latitud: -0.21, longitud: -78.49, heading: 90 });
    expect(loc.busId).toBe('B001');
    expect(loc.heading).toBe(90);
  });
});

// ─── Graph Mappers ──────────────────────────────────────────

describe('Graph node/edge mappers', () => {
  it('maps graph node DTO', () => {
    const node = mapGraphNodeDtoToGraphNode({ _id: 'n-1', label: 'Entrada', latitude: -0.21, longitude: -78.49 });
    expect(node.label).toBe('Entrada');
    expect(node.latitude).toBe(-0.21);
  });

  it('maps graph edge DTO', () => {
    const edge = mapGraphEdgeDtoToGraphEdge({ _id: 'e-1', from_node_id: 'n-1', to_node_id: 'n-2', weight: 120, blocked: false, bidirectional: true });
    expect(edge.fromNodeId).toBe('n-1');
    expect(edge.weight).toBe(120);
    expect(edge.bidirectional).toBe(true);
  });
});

// ─── Transformers (Entity → DTO) ────────────────────────────

describe('Entity to DTO transformers', () => {
  it('transforms event entity to create DTO', () => {
    const dto = transformEventToDto({
      title: 'Test', description: 'Desc', location: 'Aud', category: 'academico',
      startDate: '2026-01-01', endDate: '2026-01-02', organizer: 'Org',
    });
    expect(dto.titulo).toBe('Test');
    expect(dto.descripcion).toBe('Desc');
    expect(dto.ubicacion).toBe('Aud');
    expect(dto.fecha_inicio).toBe('2026-01-01');
    expect(dto.fecha_fin).toBe('2026-01-02');
  });

  it('transforms location entity to create DTO', () => {
    const dto = transformLocationToDto({
      name: 'Lab', category: 'academico', latitude: -0.21, longitude: -78.49,
    });
    expect(dto.nombre).toBe('Lab');
    expect(dto.latitud).toBe(-0.21);
  });

  it('transforms zone entity to create DTO', () => {
    const dto = transformZoneToDto({
      name: 'Zone', coordinates: [], fillColor: '#F00', strokeColor: '#0F0', isActive: true,
    });
    expect(dto.nombre).toBe('Zone');
    expect(dto.fill_color).toBe('#F00');
    expect(dto.activo).toBe(true);
  });

  it('transforms bus route entity to create DTO', () => {
    const dto = transformBusRouteToDto({ name: 'Ruta', color: '#ABC', isActive: true });
    expect(dto.nombre).toBe('Ruta');
    expect(dto.activo).toBe(true);
  });

  it('transforms bus stop entity to create DTO', () => {
    const dto = transformBusStopToDto({ routeId: 'r-1', name: 'Stop', latitude: -0.21, longitude: -78.49, stopOrder: 1 });
    expect(dto.ruta_id).toBe('r-1');
    expect(dto.orden).toBe(1);
  });
});
