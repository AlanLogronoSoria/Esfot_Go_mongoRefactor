import type { Favorite, CreateFavoriteInput } from './favorite.entity';

export interface IFavoriteRepository {
  getFavorites(): Promise<Favorite[]>;
  addFavorite(input: CreateFavoriteInput): Promise<Favorite>;
  removeFavorite(id: string): Promise<void>;
}
