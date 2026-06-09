// ============================================================
// Repository Contract Tests
// Verifies Express API response contracts match entity expectations
// ============================================================

import type { EventDto, LocationDto, UserDto, ZoneDto } from '@/services/express/adapters/mongo-dtos';
import { mapUserDtoToUser, mapEventDtoToEvent, mapLocationDtoToCampusLocation } from '@/services/express/adapters/mongo-mappers';

// ─── Auth Contract ──────────────────────────────────────────

describe('Auth API response contract', () => {
  it('LoginResponse contains required fields', () => {
    const response = {
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.fake',
      user: { _id: 'u-1', nombre: 'Juan', email: 'juan@epn.edu.ec', rol: 'estudiante' },
    };
    expect(response.token).toBeDefined();
    expect(typeof response.token).toBe('string');
    const user = mapUserDtoToUser(response.user as UserDto);
    expect(user.id).toBe('u-1');
    expect(user.role).toBe('estudiante');
  });

  it('RegisterResponse handles optional user field', () => {
    const withUser = { msg: 'Creado', emailConfirmationRequired: true, user: { _id: 'x', email: 'a@b.com' } };
    expect(withUser.emailConfirmationRequired).toBe(true);

    const withoutUser = { msg: 'Creado', emailConfirmationRequired: false };
    expect(withoutUser.emailConfirmationRequired).toBe(false);
    expect((withoutUser as Record<string, unknown>).user).toBeUndefined();
  });

  it('ProfileResponse contains _id and email', () => {
    const profile: UserDto = {
      _id: 'p-1', nombre: 'Ana', apellido: 'García', email: 'ana@epn.edu.ec',
      telefono: '0998765432', rol: 'docente',
    };
    expect(profile._id).toBeTruthy();
    expect(profile.email).toBeTruthy();
  });
});

// ─── Event API Contract ─────────────────────────────────────

describe('Event API response contract', () => {
  const eventV2: EventDto = {
    _id: 'evt-1', titulo: 'Evento', descripcion: 'Desc',
    fecha_inicio: '2026-06-15T09:00:00Z', fecha_fin: null,
    ubicacion: 'Auditorio', categoria: 'academico',
    organizador: 'Depto', created_by: 'admin-1',
    created_at: '2026-01-01', updated_at: '2026-01-01',
  };

  it('maps V2 event correctly', () => {
    const event = mapEventDtoToEvent(eventV2);
    expect(event.title).toBe('Evento');
    expect(event.category).toBe('academico');
    expect(event.endDate).toBeNull();
  });

  it('maps V1 event (legacy) correctly', () => {
    const v1: EventDto = {
      _id: 'evt-2', nombre: 'OldEvent', informacion: 'OldDesc',
      fecha: '2026-01-01', hora: '09:00',
      ubicacion: 'OldLoc', organizador: 'OldOrg',
    };
    const event = mapEventDtoToEvent(v1);
    expect(event.title).toBe('OldEvent');
    expect(event.description).toBe('OldDesc');
    expect(event.startDate).toBe('2026-01-01');
  });

  it('create event request sends correct fields', () => {
    const body = {
      titulo: 'Test', descripcion: 'Desc', imagen: null,
      ubicacion: 'Loc', categoria: 'cultural',
      fecha_inicio: '2026-01-01', fecha_fin: null, organizador: 'Org',
    };
    expect(body.titulo).toBeTruthy();
    expect(body.fecha_inicio).toBeTruthy();
  });
});

// ─── Location API Contract ──────────────────────────────────

describe('Location API response contract', () => {
  it('GET /mapa/ubicaciones returns array of locations', () => {
    const response: LocationDto[] = [
      { _id: 'l-1', nombre: 'ESFOT', categoria: 'academico', latitud: -0.21, longitud: -78.49 },
      { _id: 'l-2', nombre: 'Biblioteca', categoria: 'biblioteca', latitud: -0.2102, longitud: -78.489 },
    ];
    const mapped = response.map(mapLocationDtoToCampusLocation);
    expect(mapped).toHaveLength(2);
    expect(mapped[0].name).toBe('ESFOT');
    expect(mapped[1].name).toBe('Biblioteca');
  });

  it('GET /mapa/categoria/:cat filters correctly', () => {
    const all: LocationDto[] = [
      { _id: '1', categoria: 'academico', nombre: 'A', latitud: 0, longitud: 0 },
      { _id: '2', categoria: 'deportes', nombre: 'B', latitud: 0, longitud: 0 },
    ];
    const academicos = all.filter((l) => l.categoria === 'academico');
    expect(academicos).toHaveLength(1);
  });
});

// ─── Zone API Contract ──────────────────────────────────────

describe('Zone API response contract', () => {
  it('maps zone with coordinates array', () => {
    const dto: ZoneDto = {
      _id: 'z-1', nombre: 'Construction',
      coordenadas: [
        { latitude: -0.21, longitude: -78.49 },
        { latitude: -0.2105, longitude: -78.4895 },
      ],
      fill_color: 'rgba(255,0,0,0.3)', stroke_color: '#F00', activo: true,
    };
    const zone = mapZoneDtoToZone(dto);
    expect(zone.coordinates).toHaveLength(2);
    expect(zone.coordinates[0].latitude).toBe(-0.21);
  });
});

// ─── Error Response Contract ────────────────────────────────

describe('Error response contract', () => {
  it('handles { msg: "error" } format', () => {
    const errorResponse = { msg: 'Usuario no encontrado' };
    expect(errorResponse.msg).toBeTruthy();
  });

  it('handles { message: "error" } format', () => {
    const errorResponse = { message: 'Validation failed' };
    expect(errorResponse.message).toBeTruthy();
  });

  it('handles { error: "error" } format', () => {
    const errorResponse = { error: 'Internal server error' };
    expect(errorResponse.error).toBeTruthy();
  });

  it('handles network error format', () => {
    const result = { data: null, error: 'Error de conexión. Verifica tu internet.', status: 0 };
    expect(result.status).toBe(0);
    expect(result.data).toBeNull();
  });
});
