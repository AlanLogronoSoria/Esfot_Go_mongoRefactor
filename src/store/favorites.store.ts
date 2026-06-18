import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CampusLocation } from '@/features/map/domain/location.entity';

interface FavoriteLocation {
  id: string;
  name: string;
  description: string | null;
  category: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  image?: string;
  image360?: string;
  mediaType?: string;
}

interface FavoritesState {
  locations: FavoriteLocation[];
  addLocation: (location: CampusLocation) => void;
  removeLocation: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleLocation: (location: CampusLocation) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      locations: [],

      addLocation: (location) => {
        const { locations } = get();
        if (locations.some((f) => f.id === location.id)) return;
        set({
          locations: [
            ...locations,
            {
              id: location.id,
              name: location.name,
              description: location.description,
              category: location.category,
              latitude: location.latitude,
              longitude: location.longitude,
              imageUrl: location.imageUrl,
              image: location.image,
              image360: location.image360,
              mediaType: location.mediaType,
            },
          ],
        });
      },

      removeLocation: (id) => {
        set({ locations: get().locations.filter((f) => f.id !== id) });
      },

      isFavorite: (id) => get().locations.some((f) => f.id === id),

      toggleLocation: (location) => {
        if (get().isFavorite(location.id)) {
          get().removeLocation(location.id);
        } else {
          get().addLocation(location);
        }
      },
    }),
    {
      name: 'esfotgo-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
