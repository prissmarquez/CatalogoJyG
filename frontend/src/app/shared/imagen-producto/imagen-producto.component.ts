import { Component, input, signal } from '@angular/core';

/**
 * Imagen de tarjeta de producto con aviso "Imagen no disponible" cuando no hay
 * imagen o falla la carga. Se aplica sobre `<div class="best-seller-image">`.
 */
@Component({
  selector: '[appImagenProducto]',
  template: `
    <span [hidden]="src() && !fallo()">Imagen no disponible</span>
    @if (src() && !fallo()) {
      <img referrerpolicy="no-referrer" [alt]="alt()" loading="lazy" [src]="src()" (error)="fallo.set(true)">
    }
  `,
})
export class ImagenProductoComponent {
  readonly src = input<string | undefined>();
  readonly alt = input('Producto');

  protected readonly fallo = signal(false);
}
