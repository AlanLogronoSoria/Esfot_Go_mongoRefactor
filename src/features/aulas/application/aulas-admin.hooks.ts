import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExpressAdminAulasRepository } from '@/services/express/express-repositories';
import { useExpressAuthStore } from '@/services/express/express-auth.store';
import * as SecureStore from 'expo-secure-store';
import type { Aula } from '@/services/express/express-types';

const adminRepo = new ExpressAdminAulasRepository();
const AUTH_TOKEN_KEY = 'esfotgo_jwt_token';

async function getToken(): Promise<string> {
  const token = useExpressAuthStore.getState().expressToken;
  if (token) return token;

  const stored = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  if (stored) {
    console.log('[AulasAdmin] Token obtenido vía fallback SecureStore');
    return stored;
  }

  console.log('[AulasAdmin] No se encontró token de autenticación');
  throw new Error('No estás autenticado');
}

export function useCreateAula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<Aula>) => {
      const token = await getToken();
      console.log('[AulasAdmin] Creando aula:', input.nombre);
      const res = await adminRepo.createAula(input, token);
      if (res.error) {
        console.log('[AulasAdmin] Error creando aula:', res.error);
        throw new Error(res.error);
      }
      console.log('[AulasAdmin] Aula creada exitosamente');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['express', 'aulas'] });
    },
  });
}

export function useUpdateAula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Aula> }) => {
      const token = await getToken();
      const res = await adminRepo.updateAula(id, data, token);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['express', 'aulas'] });
    },
  });
}

export function useDeleteAula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      const res = await adminRepo.deleteAula(id, token);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['express', 'aulas'] });
    },
  });
}
