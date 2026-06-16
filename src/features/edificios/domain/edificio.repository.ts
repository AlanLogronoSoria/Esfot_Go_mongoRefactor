import type { Edificio } from './edificio.entity';

export interface IEdificioRepository {
  getEdificios(): Promise<Edificio[]>;
  getEdificioById(id: string): Promise<Edificio | null>;
  getAulasByEdificio(edificioId: string): Promise<Record<string, unknown>[]>;
}
