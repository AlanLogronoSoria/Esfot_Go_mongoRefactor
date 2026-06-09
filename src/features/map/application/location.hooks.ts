import { useQuery } from '@tanstack/react-query';
import { ExpressLocationRepository } from '../infrastructure/express-location.repository';
import type { CampusLocation } from '../domain/location.entity';
import { isDevMode } from '@/core/config/env';
import { MockData } from '@/core/dev/mock-services';

const repository = new ExpressLocationRepository();

export function useCampusLocations(category?: string) {
  return useQuery<CampusLocation[]>({
    queryKey: ['campus-locations', { category }],
    queryFn: () => {
      if (isDevMode()) return MockData.getCampusLocations();
      return repository.getCampusLocations(category);
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
  });
}

export function useLocationDetail(id: string) {
  return useQuery<CampusLocation>({
    queryKey: ['campus-locations', id],
    queryFn: () => repository.getLocationById(id),
    enabled: !!id,
  });
}
