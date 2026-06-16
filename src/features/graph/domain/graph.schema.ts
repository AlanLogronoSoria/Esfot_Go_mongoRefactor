import { z } from 'zod';

export const graphNodeSchema = z.object({
  label: z
    .string()
    .min(1, 'La etiqueta es requerida')
    .max(100, 'La etiqueta no debe exceder 100 caracteres'),
  latitude: z
    .number()
    .min(-90, 'Latitud fuera de rango (-90 a 90)')
    .max(90, 'Latitud fuera de rango (-90 a 90)')
    .refine((v) => v !== 0, 'La latitud no puede ser 0'),
  longitude: z
    .number()
    .min(-180, 'Longitud fuera de rango (-180 a 180)')
    .max(180, 'Longitud fuera de rango (-180 a 180)')
    .refine((v) => v !== 0, 'La longitud no puede ser 0'),
});

export const graphEdgeSchema = z.object({
  fromNodeId: z.string().min(1, 'El nodo origen es requerido'),
  toNodeId: z.string().min(1, 'El nodo destino es requerido'),
  weight: z
    .number()
    .min(0.1, 'El peso mínimo es 0.1 metros')
    .max(10000, 'El peso máximo es 10000 metros'),
  blocked: z.boolean(),
  bidirectional: z.boolean(),
});

export type GraphNodeFormInput = z.infer<typeof graphNodeSchema>;
export type GraphEdgeFormInput = z.infer<typeof graphEdgeSchema>;
