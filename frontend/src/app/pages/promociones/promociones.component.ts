import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ApiService, GrupoPromocion, ProductoPromocion } from '../../core/api.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ImagenProductoComponent } from '../../shared/imagen-producto/imagen-producto.component';

const moneda = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface GrupoVisible extends GrupoPromocion {
  tarjetas: ProductoPromocion[];
}

@Component({
  selector: 'app-promociones',
  imports: [RouterLink, FooterComponent, ImagenProductoComponent],
  template: `
    <nav class="navbar" aria-label="Navegación principal">
      <div class="navbar-inner">
        <div class="brand"><a routerLink="/"><img class="brand-logo" src="assets/logo1.png" alt="Materiales JyG" width="536" height="350"><div class="brand-sub">Catálogo de productos</div></a></div>
        <a class="promotions-btn" routerLink="/promociones" aria-current="page"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="flex-shrink:0"><path d="M20 13 11 22 2 13V2h11l9 9a1.4 1.4 0 0 1 0 2l-2 2" transform="translate(1 0) scale(.9)"/><circle cx="7" cy="7" r="1.5"/><path d="m10 16 6-6"/></svg><span>Promociones</span></a>
        <a class="promotions-back" routerLink="/">Volver al inicio</a>
      </div>
    </nav>

    <main class="promotions-page">
      <header class="promotions-intro">
        <span class="hero-badge">Materiales JyG</span>
        <h1><span class="promotions-title-lead">Los favoritos del mes</span><br><span class="promotions-title-highlight">¡10% de descuento!</span></h1>
        <p>Los mejores precios y promociones para renovar tu hogar, válidas durante noviembre de 2026. Precios en MXN.</p>
        <p>Los descuentos se calculan sobre el precio de lista de los productos.</p>
      </header>

      <p id="promotionsStatus" role="status">@if (estado()) { {{ estado() }} }</p>
      <button id="promotionsRetry" class="primary-btn" type="button" [hidden]="!mostrarReintentar()" (click)="cargar()">Reintentar</button>

      <div id="promotionsProducts">
        @for (grupo of grupos(); track $index) {
          <section class="promotion-group">
            <h2>{{ grupo.titulo }}</h2>
            @if (grupo.nota) {
              <p>{{ grupo.nota }}</p>
            }
            <div class="promotion-products-grid">
              @for (producto of grupo.tarjetas; track $index) {
                <a class="best-seller-card offer-card" routerLink="/producto" [queryParams]="{ clave: producto.Clave, linea: producto.linea }">
                  <span class="discount-badge">{{ insignia(producto) }}</span>
                  <div class="best-seller-image" appImagenProducto [src]="producto.Imagenes" [alt]="producto.Nombre"></div>
                  <h3>{{ producto.Nombre }}</h3>
                  <p>Clave: {{ producto.Clave }}</p>

                  @if (producto.esRegalo) {
                    <strong class="offer-price">Gratis con tu compra participante</strong>
                  } @else if (producto.precioEspecial != null) {
                    @if (producto.precioLista != null) {
                      <del class="offer-original-price" [attr.aria-label]="'Precio de lista: ' + precio(producto.precioLista)">{{ precio(producto.precioLista) }}</del>
                    }
                    <strong class="offer-price" [attr.aria-label]="'Precio especial: ' + precio(producto.precioEspecial)">{{ precio(producto.precioEspecial) }}</strong>
                  } @else if (producto.precioLista != null && producto.precioPromocion != null) {
                    <del class="offer-original-price" [attr.aria-label]="'Precio de lista: ' + precio(producto.precioLista)">{{ precio(producto.precioLista) }}</del>
                    <strong class="offer-price" [attr.aria-label]="'Precio con descuento: ' + precio(producto.precioPromocion)">{{ precio(producto.precioPromocion) }}</strong>
                  } @else if (producto.precioLista != null) {
                    <strong class="offer-price">{{ precio(producto.precioLista) }}</strong>
                  } @else {
                    <p class="offer-price-pending">Consulta el precio de este producto</p>
                  }
                </a>
              }
            </div>
          </section>
        }
      </div>

      <p class="promotions-payment-note">Las promociones aplican únicamente con pago en efectivo o transferencia. No aplican pagos con tarjeta ni a crédito.</p>
    </main>

    <app-footer />
  `,
})
export class PromocionesComponent {
  protected readonly grupos = signal<GrupoVisible[]>([]);
  protected readonly estado = signal('Cargando promociones…');
  protected readonly mostrarReintentar = signal(false);

  private readonly api = inject(ApiService);

  constructor() {
    // El CSS resalta el botón "Promociones" con la clase .promotions-view en <body>.
    const body = inject(DOCUMENT).body;
    body.classList.add('promotions-view');
    inject(DestroyRef).onDestroy(() => body.classList.remove('promotions-view'));

    this.cargar();
  }

  protected cargar(): void {
    this.estado.set('Cargando promociones…');
    this.mostrarReintentar.set(false);

    this.api.promociones().subscribe({
      next: ({ grupos }) => {
        const visibles = grupos
          .filter(grupo => grupo.productos.length || grupo.nota)
          .map(grupo => ({ ...grupo, tarjetas: [...grupo.productos, ...(grupo.regalos || [])] }));
        const total = visibles.reduce((suma, grupo) => suma + grupo.tarjetas.length, 0);
        this.grupos.set(visibles);
        this.estado.set(total ? '' : 'No hay promociones disponibles por el momento.');
      },
      error: () => {
        this.estado.set('No se pudieron cargar las promociones. Intenta de nuevo.');
        this.mostrarReintentar.set(true);
      },
    });
  }

  protected insignia(producto: ProductoPromocion): string {
    if (producto.esRegalo) return 'Artículo de regalo';
    return producto.beneficio || `${producto.descuento}% de descuento`;
  }

  protected precio(valor: number): string {
    return moneda.format(valor);
  }
}
