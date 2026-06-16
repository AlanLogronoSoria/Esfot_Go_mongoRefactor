import { z } from 'zod';

export const busRouteSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no debe exceder 100 caracteres'),
  description: z.string().max(500).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe ser un HEX válido (#RRGGBB)'),
  estimatedTime: z
    .number()
    .int('El tiempo debe ser un número entero')
    .min(1, 'El tiempo mínimo es 1 minuto')
    .max(1440, 'El tiempo máximo es 1440 minutos')
    .optional()
    .nullable(),
  distance: z
    .number()
    .min(0, 'La distancia no puede ser negativa')
    .optional()
    .nullable(),
  direction: z
    .string()
    .max(200, 'La dirección no debe exceder 200 caracteres')
    .optional()
    .nullable(),
});

export const busStopSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no debe exceder 100 caracteres'),
  latitude: z
    .number()
    .min(-90, 'Latitud fuera de rango')
    .max(90, 'Latitud fuera de rango'),
  longitude: z
    .number()
    .min(-180, 'Longitud fuera de rango')
    .max(180, 'Longitud fuera de rango'),
  stopOrder: z
    .number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden mínimo es 0'),
});

export type BusRouteFormInput = z.infer<typeof busRouteSchema>;
export type BusStopFormInput = z.infer<typeof busStopSchema>;
