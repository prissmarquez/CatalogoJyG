import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, catchError, switchMap, tap } from 'rxjs';

import { ApiService, Producto } from '../../core/api.service';
import { VolverComponent } from '../../shared/volver/volver.component';

@Component({
  selector: 'app-producto',
  imports: [RouterLink, VolverComponent],
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
      </div>
    </nav>

    @if (linea(); as lineaActual) {
      <app-volver destino="/linea" [queryParams]="{ linea: lineaActual }" />
    } @else {
      <app-volver destino="/catalogo" />
    }

    <!-- PRODUCTO -->
    <p id="productStatus" class="product-status" role="status">@if (estado()) { {{ estado() }} }</p>

    <main class="product-page" id="productDetails" [hidden]="!producto()">
      @if (producto(); as p) {
        <!-- IMAGEN -->
        <div class="product-gallery">
          @if (p.Imagenes && !imagenFallo()) {
            <img
              referrerpolicy="no-referrer"
              id="productImage"
              [alt]="p.Nombre || 'Imagen del producto'"
              [src]="p.Imagenes"
              (error)="imagenFallo.set(true)"
              style="width:100%; max-width:500px; border-radius:20px;"
            >
          } @else {
            <p id="productImagePlaceholder" class="image-placeholder">Imagen no disponible</p>
          }
        </div>

        <!-- INFO -->
        <div class="product-info">
          <div class="product-line" id="productLine">{{ p.linea }}</div>

          <h1 id="productName">{{ p.Nombre || 'Producto' }}</h1>

          <p class="product-description" id="productDescription">{{ p.Descripcion || 'Sin descripción disponible.' }}</p>

          <!-- DATOS -->
          <div class="product-data">
            <div class="data-card">
              <span>Código</span>
              <strong id="productCode">{{ p.Clave }}</strong>
            </div>

            <div class="data-card">
              <span>Disponibilidad</span>
              <strong>En existencia</strong>
            </div>
          </div>
        </div>
      }
    </main>
  `,
})
export class ProductoComponent {
  protected readonly linea = signal<string | null>(null);
  protected readonly producto = signal<Producto | null>(null);
  protected readonly estado = signal('Cargando producto…');
  protected readonly imagenFallo = signal(false);

  private readonly api = inject(ApiService);
  private readonly title = inject(Title);

  constructor() {
    inject(ActivatedRoute)
      .queryParamMap.pipe(
        tap(params => {
          this.linea.set(params.get('linea'));
          this.producto.set(null);
          this.imagenFallo.set(false);
          this.estado.set('Cargando producto…');
          this.title.setTitle('Producto | Materiales JyG');
        }),
        switchMap(params => {
          const clave = params.get('clave');
          if (!clave) {
            this.estado.set('Falta la clave del producto en la dirección.');
            return EMPTY;
          }
          return this.api.producto(clave, params.get('linea')).pipe(
            catchError((error: HttpErrorResponse) => {
              this.estado.set(
                error.status
                  ? error.error?.error || 'No se pudo cargar el producto.'
                  : 'No se pudo cargar el producto. Recarga para intentarlo de nuevo.',
              );
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(producto => {
        this.producto.set(producto);
        this.title.setTitle(`${producto.Nombre || 'Producto'} | Materiales JyG`);
        this.estado.set('');
      });
  }
}
