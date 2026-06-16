export interface Edificio {
  id: string;
  nombre: string;
  descripcion: string | null;
  latitud: number | null;
  longitud: number | null;
  pisos: number | null;
  imagen: string | null;
  createdAt: string;
}
