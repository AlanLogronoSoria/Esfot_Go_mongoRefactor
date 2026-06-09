import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ExpressPoiRepository } from '../infrastructure/express-poi.repository';
import { poiEventBus } from './poi-events';
import { useAuthStore } from '@/store/auth.store';
import type { CampusLocation } from '@/features/map/domain/location.entity';
import type { PoiInput, PoiUpdateInput, RestrictedZone } from '../domain/poi.entity';

const repository = new ExpressPoiRepository();

export function useAdminPois() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? 'dev');

  const query = useQuery<CampusLocation[]>({
    queryKey: ['admin', 'pois'],
    queryFn: () => repository.getAll(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    const unsubscribe = repository.subscribeToChanges(() => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pois'] });
    });

    const unsubEventBus = poiEventBus.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pois'] });
    });

    return () => {
      unsubscribe();
      unsubEventBus();
    };
  }, [queryClient]);

  const createPoi = useMutation({
    mutationFn: (input: PoiInput) => repository.create(input, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'pois'] }),
  });

  const updatePoi = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PoiUpdateInput }) =>
      repository.update(id, input, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'pois'] }),
  });

  const deletePoi = useMutation({
    mutationFn: (id: string) => repository.delete(id, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'pois'] }),
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

  const createZone = useMutation({
    mutationFn: (input: Omit<RestrictedZone, 'id' | 'createdAt' | 'updatedAt'>) => repository.createZone(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'zones'] }),
  });

  const updateZone = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<RestrictedZone> }) => repository.updateZone(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'zones'] }),
  });

  const deleteZone = useMutation({
    mutationFn: (id: string) => repository.deleteZone(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'zones'] }),
  });

  return {
    zones: query.data ?? [],
    isLoading: query.isLoading,
    createZone,
    updateZone,
    deleteZone,
  };
}
