import { useQuery } from '@tanstack/react-query';
import { ExpressEdificioRepository } from '../infrastructure/express-edificio.repository';
import type { Edificio } from '../domain/edificio.entity';
import { isDevMode } from '@/core/config/env';

const repository = new ExpressEdificioRepository();

const MOCK_EDIFICIOS: Edificio[] = [
  {
    id: 'edif-1', nombre: 'Edificio Principal ESFOT',
    descripcion: 'Edificio central con aulas, secretaría y dirección académica',
    latitud: -0.2095, longitud: -78.4905, pisos: 3, imagen: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'edif-2', nombre: 'Bloque de Laboratorios',
    descripcion: 'Complejo de laboratorios de ingeniería y tecnología',
    latitud: -0.2105, longitud: -78.4890, pisos: 2, imagen: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'edif-3', nombre: 'Biblioteca Central',
    descripcion: 'Centro de recursos bibliográficos y salas de estudio',
    latitud: -0.2085, longitud: -78.4910, pisos: 2, imagen: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'edif-4', nombre: 'Cafetería EPN',
    descripcion: 'Área de alimentación y descanso del campus',
    latitud: -0.2100, longitud: -78.4900, pisos: 1, imagen: null,
    createdAt: new Date().toISOString(),
  },
];

const MOCK_AULAS_BY_EDIFICIO: Record<string, Record<string, unknown>[]> = {
  'edif-1': [
    { _id: 'aula-101', nombre: 'Aula 101 - Matemáticas', capacidad: 40, ubicacion: 'Edificio Principal ESFOT - Piso 1', estado: 'disponible' },
    { _id: 'aula-102', nombre: 'Aula 102 - Física', capacidad: 35, ubicacion: 'Edificio Principal ESFOT - Piso 1', estado: 'disponible' },
    { _id: 'aula-201', nombre: 'Aula 201 - Programación', capacidad: 30, ubicacion: 'Edificio Principal ESFOT - Piso 2', estado: 'disponible' },
  ],
  'edif-2': [
    { _id: 'lab-301', nombre: 'Laboratorio de Redes', capacidad: 25, ubicacion: 'Bloque de Laboratorios - Piso 1', estado: 'disponible' },
    { _id: 'lab-302', nombre: 'Laboratorio de Electrónica', capacidad: 20, ubicacion: 'Bloque de Laboratorios - Piso 1', estado: 'mantenimiento' },
  ],
};

export function useEdificios() {
  return useQuery<Edificio[]>({
    queryKey: ['edificios'],
    queryFn: async () => {
      if (isDevMode()) return MOCK_EDIFICIOS;
      return repository.getEdificios();
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
}

export function useEdificioDetail(id: string) {
  return useQuery<Edificio | null>({
    queryKey: ['edificios', id],
    queryFn: async () => {
      if (isDevMode()) return MOCK_EDIFICIOS.find((e) => e.id === id) ?? null;
      return repository.getEdificioById(id);
    },
    enabled: !!id,
  });
}

export function useAulasByEdificio(edificioId: string) {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ['edificios', edificioId, 'aulas'],
    queryFn: async () => {
      if (isDevMode()) return MOCK_AULAS_BY_EDIFICIO[edificioId] ?? [];
      return repository.getAulasByEdificio(edificioId);
    },
    enabled: !!edificioId,
  });
}
