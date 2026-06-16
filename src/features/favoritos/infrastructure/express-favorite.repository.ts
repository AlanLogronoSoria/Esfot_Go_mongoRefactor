import * as SecureStore from 'expo-secure-store';
import { httpClient } from '@/services/http-client';
import { AppError } from '@/core/errors/app-error';
import type { IFavoriteRepository } from '../domain/favorite.repository';
import type { Favorite, CreateFavoriteInput } from '../domain/favorite.entity';
import { mapFavoriteDtoToFavorite } from '@/services/express/adapters/mongo-mappers';
import type { FavoriteDto } from '@/services/express/adapters/mongo-dtos';

const AUTH_TOKEN_KEY = 'esfotgo_jwt_token';

export class ExpressFavoriteRepository implements IFavoriteRepository {
  private async token(): Promise<string | null> {
    try { return SecureStore.getItemAsync(AUTH_TOKEN_KEY); } catch { return null; }
  }

  async getFavorites(): Promise<Favorite[]> {
    const t = await this.token();
    const { data, error } = await httpClient.get<Record<string, unknown>[]>('/favoritos', t);
    if (error) {
      console.log('[ExpressFavoriteRepo] Error obteniendo favoritos:', error);
      return [];
    }
    console.log(`[ExpressFavoriteRepo] ${(data ?? []).length} favoritos obtenidos`);
    return (data ?? []).map((r) => mapFavoriteDtoToFavorite(r as FavoriteDto));
  }

  async addFavorite(input: CreateFavoriteInput): Promise<Favorite> {
    const t = await this.token();
    const payload = {
      item_id: input.itemId,
      item_tipo: input.itemType,
      item_nombre: input.itemName,
      item_data: input.itemData,
    };
    const { data, error } = await httpClient.post<Record<string, unknown>>('/favoritos', payload, t);
    if (error || !data) {
      console.log('[ExpressFavoriteRepo] Error agregando favorito:', error);
      throw new AppError(error ?? 'Error al guardar favorito', 'FAVORITE_ERROR');
    }
    console.log(`[ExpressFavoriteRepo] Favorito agregado: ${input.itemName}`);
    return mapFavoriteDtoToFavorite(data as FavoriteDto);
  }

  async removeFavorite(id: string): Promise<void> {
    const t = await this.token();
    const { error } = await httpClient.delete(`/favoritos/${id}`, t);
    if (error) {
      console.log('[ExpressFavoriteRepo] Error eliminando favorito:', error);
      throw new AppError(error, 'FAVORITE_ERROR');
    }
    console.log(`[ExpressFavoriteRepo] Favorito eliminado: ${id}`);
  }
}
