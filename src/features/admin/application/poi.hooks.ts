import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { ExpressPoiRepository } from '../infrastructure/express-poi.repository';
import { useAuthStore } from '@/store/auth.store';
import type { CampusLocation } from '@/features/map/domain/location.entity';
import type { PoiInput, PoiUpdateInput, RestrictedZone } from '../domain/poi.entity';

const repository = new ExpressPoiRepository();

export function useAdminPois() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? '');

  const query = useQuery<CampusLocation[]>({
    queryKey: ['admin', 'pois'],
    queryFn: () => repository.getAll(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    const unsubscribe = repository.subscribeToChanges(() => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pois'] });
      queryClient.invalidateQueries({ queryKey: ['campus-locations'] });
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'pois'] });
    queryClient.invalidateQueries({ queryKey: ['campus-locations'] });
  };

  const createPoi = useMutation({
    mutationFn: (input: PoiInput) => repository.create(input, userId),
    onSuccess: invalidateAll,
    onError: () => Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo crear la ubicación' }),
  });

  const updatePoi = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PoiUpdateInput }) =>
      repository.update(id, input, userId),
    onSuccess: invalidateAll,
    onError: () => Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo actualizar la ubicación' }),
  });

  const deletePoi = useMutation({
    mutationFn: (id: string) => repository.delete(id, userId),
    onSuccess: invalidateAll,
    onError: () => Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar la ubicación' }),
  });

  return {
    pois: query.data ?? [],
    isLoading: query.isLoading,
    createPoi,
    updatePoi,
    deletePoi,
  };
}

export function useAdminZones() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'zones'],
    queryFn: () => repository.getZones(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'zones'] });
    }, 30000);
    return () => clearInterval(interval);
  }, [queryClient]);

  const invalidateZones = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'zones'] });
  };

  const createZone = useMutation({
    mutationFn: (input: Omit<RestrictedZone, 'id' | 'createdAt' | 'updatedAt'>) => repository.createZone(input),
    onSuccess: invalidateZones,
    onError: () => Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo crear la zona' }),
  });

  const updateZone = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<RestrictedZone> }) => repository.updateZone(id, input),
    onSuccess: invalidateZones,
    onError: () => Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo actualizar la zona' }),
  });

  const deleteZone = useMutation({
    mutationFn: (id: string) => repository.deleteZone(id),
    onSuccess: invalidateZones,
    onError: () => Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar la zona' }),
  });

  return {
    zones: query.data ?? [],
    isLoading: query.isLoading,
    createZone,
    updateZone,
    deleteZone,
  };
}
