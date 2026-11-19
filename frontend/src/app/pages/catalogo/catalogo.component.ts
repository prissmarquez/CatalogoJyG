import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LINEAS_CATALOGO } from '../../core/lineas';
import { BuscadorComponent } from '../../shared/buscador/buscador.component';
import { VolverComponent } from '../../shared/volver/volver.component';

@Component({
  selector: 'app-catalogo',
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

    <app-volver destino="/" />

    <!-- HERO -->
    <section class="catalog-hero">
      <div class="catalog-badge">
        +120 líneas de productos
      </div>

      <h1>
        Catálogo completo
      </h1>

      <p>
        Explora todas nuestras líneas organizadas
        alfabéticamente.
      </p>
    </section>

    <main class="catalog-container">
      @for (grupo of lineas; track grupo.letra) {
        <section class="catalog-section">
          <h2>{{ grupo.letra }}</h2>
          <div class="catalog-list">
            @for (linea of grupo.lineas; track $index) {
              <a routerLink="/linea" [queryParams]="{ linea: linea.valor }">{{ linea.texto }}</a>
            }
          </div>
        </section>
      }
    </main>
  `,
})
export class CatalogoComponent {
  protected readonly lineas = LINEAS_CATALOGO;
}
