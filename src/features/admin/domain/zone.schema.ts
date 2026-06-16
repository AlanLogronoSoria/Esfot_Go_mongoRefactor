import { z } from 'zod';

export const zoneRestrictionTypeSchema = z.enum([
  'acceso_restringido',
  'construccion',
  'peatonal',
  'emergencia',
  'ambiental',
  'seguridad',
  'otro',
]);

export const zoneCoordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const zoneSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no debe exceder 100 caracteres'),
  description: z.string().max(500).optional(),
  coordinates: z
    .array(zoneCoordinateSchema)
    .min(3, 'Se necesitan al menos 3 puntos para un polígono')
    .max(100, 'Máximo 100 puntos por zona'),
  fillColor: z
    .string()
    .regex(/^(rgba?\(.+\)|#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})$/, 'Color de relleno inválido'),
  strokeColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'El color de borde debe ser un HEX válido (#RRGGBB)'),
  isActive: z.boolean(),
  restrictionType: zoneRestrictionTypeSchema,
  activeSchedule: z
    .string()
    .max(200, 'El horario no debe exceder 200 caracteres')
    .optional()
    .nullable(),
});

export type ZoneFormInput = z.infer<typeof zoneSchema>;
export type ZoneCoordinate = z.infer<typeof zoneCoordinateSchema>;
export type ZoneRestrictionType = z.infer<typeof zoneRestrictionTypeSchema>;
