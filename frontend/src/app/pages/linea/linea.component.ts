import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, catchError, map, of, switchMap, tap } from 'rxjs';

import { ApiService, Producto } from '../../core/api.service';
import { BuscadorComponent } from '../../shared/buscador/buscador.component';
import { VolverComponent } from '../../shared/volver/volver.component';

@Component({
  selector: 'app-linea',
  imports: [RouterLink, BuscadorComponent, VolverComponent],
  template: `
    <!-- NAVBAR -->
    <nav class="navbar">
      <div class="navbar-inner">
        <div class="brand">
          <a routerLink="/">
            <img class="brand-logo" src="assets/logo1.png" alt="Materiales JyG" width="536" height="350">
            <div class="brand-sub">
              Catálogo de productos
            </div>
          </a>
        </div>

        <!-- SEARCH -->
        <div class="search-wrap" appBuscador></div>
      </div>
    </nav>

    <app-volver destino="/catalogo" />

    <!-- HERO -->
    <section class="line-hero">
      <div class="line-badge">
        Línea de productos
      </div>

      <h1 id="lineTitle">{{ linea() }}</h1>

      <p>
        Productos disponibles en esta línea.
      </p>
    </section>

    <!-- LISTA PRODUCTOS -->
    <main class="products-list" id="productsList">
      @if (productos(); as lista) {
        @for (producto of lista; track $index) {
          <a class="product-item" routerLink="/producto" [queryParams]="{ linea: linea(), clave: producto.Clave }">{{ producto.Nombre }}</a>
        } @empty {
          <p>No se encontraron productos.</p>
        }
      }
    </main>
  `,
})
export class LineaComponent {
  protected readonly linea = signal('');
  /** null mientras carga (la lista se queda vacía, como en el sitio original). */
  protected readonly productos = signal<Producto[] | null>(null);

  private readonly api = inject(ApiService);
  private readonly title = inject(Title);

  constructor() {
    inject(ActivatedRoute)
      .queryParamMap.pipe(
        map(params => params.get('linea')),
        tap(linea => {
          this.linea.set(linea ?? '');
          this.productos.set(null);
          this.title.setTitle(`${linea || 'Línea'} | Materiales JyG`);
        }),
        switchMap(linea => {
          if (!linea) return EMPTY;
          return this.api.productosDeLinea(linea).pipe(
            map(data => (Array.isArray(data) ? data : data.productos || [])),
            catchError((error: HttpErrorResponse) => {
              console.error(error);
              // El servidor respondió con error: se muestra "No se encontraron productos."
              return error.status ? of([] as Producto[]) : EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(productos => this.productos.set(productos));
  }
}
