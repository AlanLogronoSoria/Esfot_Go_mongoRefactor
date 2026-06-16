import * as SecureStore from 'expo-secure-store';
import { httpClient } from '@/services/http-client';
import { AppError } from '@/core/errors/app-error';
import type { IEdificioRepository } from '../domain/edificio.repository';
import type { Edificio } from '../domain/edificio.entity';
import { mapEdificioDtoToEdificio } from '@/services/express/adapters/mongo-mappers';
import type { EdificioDto } from '@/services/express/adapters/mongo-dtos';

const AUTH_TOKEN_KEY = 'esfotgo_jwt_token';

export class ExpressEdificioRepository implements IEdificioRepository {
  private async token(): Promise<string | null> {
    try { return SecureStore.getItemAsync(AUTH_TOKEN_KEY); } catch { return null; }
  }

  async getEdificios(): Promise<Edificio[]> {
    const t = await this.token();
    const { data, error } = await httpClient.get<Record<string, unknown>[]>('/edificios', t);
    if (error) {
      console.log('[ExpressEdificioRepo] Error obteniendo edificios:', error);
      return [];
    }
    console.log(`[ExpressEdificioRepo] ${(data ?? []).length} edificios obtenidos`);
    return (data ?? []).map((r) => mapEdificioDtoToEdificio(r as EdificioDto));
  }

  async getEdificioById(id: string): Promise<Edificio | null> {
    const t = await this.token();
    const { data, error } = await httpClient.get<Record<string, unknown>>(`/edificios/${id}`, t);
    if (error || !data) {
      console.log(`[ExpressEdificioRepo] Edificio ${id} no encontrado:`, error);
      return null;
    }
    return mapEdificioDtoToEdificio(data as EdificioDto);
  }

  async getAulasByEdificio(edificioId: string): Promise<Record<string, unknown>[]> {
    const t = await this.token();
    const { data, error } = await httpClient.get<Record<string, unknown>[]>(`/edificios/${edificioId}/aulas`, t);
    if (error) {
      console.log(`[ExpressEdificioRepo] Error obteniendo aulas del edificio ${edificioId}:`, error);
      return [];
    }
    console.log(`[ExpressEdificioRepo] ${(data ?? []).length} aulas para edificio ${edificioId}`);
    return data ?? [];
  }
}
