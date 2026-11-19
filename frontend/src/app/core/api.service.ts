import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Fila de un producto tal como llega desde Google Sheets. */
export interface Producto {
  Clave: string;
  Nombre: string;
  Descripcion?: string;
  Imagenes?: string;
  linea?: string;
  [columna: string]: unknown;
}

export interface ResultadoBusqueda {
  Clave: string;
  Nombre: string;
  linea: string;
}

export interface ProductoPromocion extends Producto {
  descuento?: number;
  beneficio?: string;
  precioEspecial?: number | null;
  precioLista?: number | null;
  precioPromocion?: number | null;
  esRegalo?: boolean;
}

export interface GrupoPromocion {
  titulo: string;
  nota?: string;
  productos: ProductoPromocion[];
  regalos?: ProductoPromocion[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  productosDeLinea(linea: string): Observable<{ productos?: Producto[] } | Producto[]> {
    return this.http.get<{ productos?: Producto[] } | Producto[]>(
      `/api/productos/${encodeURIComponent(linea)}`,
    );
  }

  producto(clave: string, linea?: string | null): Observable<Producto> {
    const params = linea ? new HttpParams().set('linea', linea) : undefined;
    return this.http.get<Producto>(`/api/producto/${encodeURIComponent(clave)}`, { params });
  }

  buscar(texto: string): Observable<ResultadoBusqueda[]> {
    return this.http.get<ResultadoBusqueda[]>('/api/busqueda', {
      params: new HttpParams().set('q', texto),
    });
  }

  masVendidos(): Observable<{ productos: Producto[] }> {
    return this.http.get<{ productos: Producto[] }>('/api/mas-vendidos');
  }

  promociones(): Observable<{ grupos: GrupoPromocion[] }> {
    return this.http.get<{ grupos: GrupoPromocion[] }>('/api/promociones');
  }
}
