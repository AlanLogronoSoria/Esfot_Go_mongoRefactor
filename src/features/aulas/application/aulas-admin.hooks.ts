import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExpressAdminAulasRepository } from '@/services/express/express-repositories';
import { useExpressAuthStore } from '@/services/express/express-auth.store';
import type { Aula } from '@/services/express/express-types';

const adminRepo = new ExpressAdminAulasRepository();

async function getToken(): Promise<string> {
  const token = useExpressAuthStore.getState().expressToken;
  if (!token) throw new Error('No estás autenticado');
  return token;
}

export function useCreateAula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<Aula>) => {
      const token = await getToken();
      const res = await adminRepo.createAula(input, token);
      if (res.error) throw new Error(res.error);
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
