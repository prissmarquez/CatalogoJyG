import { Component, computed, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { HistorialService } from '../../core/historial.service';

/**
 * Enlace "← Volver" (antes navegacion.js).
 * Regresa por el historial si el usuario viene de otra página del catálogo;
 * si no, va a la página indicada en `destino`.
 */
@Component({
  selector: 'app-volver',
  template: `
    <nav class="back-navigation" aria-label="Regresar">
      <a class="back-link" [href]="href()" (click)="volver($event)"><span aria-hidden="true">←</span> Volver</a>
    </nav>
  `,
  styles: `:host { display: contents; }`,
})
export class VolverComponent {
  readonly destino = input.required<string>();
  readonly queryParams = input<Record<string, string> | null>(null);

  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly historial = inject(HistorialService);

  private readonly url = computed(() =>
    this.router.createUrlTree([this.destino()], { queryParams: this.queryParams() ?? undefined }),
  );
  protected readonly href = computed(() => this.router.serializeUrl(this.url()));

  protected volver(evento: MouseEvent): void {
    // Ctrl/Cmd/Shift + clic: dejar que el navegador abra el enlace normalmente.
    if (evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
    evento.preventDefault();
    if (this.historial.vieneDelCatalogo) {
      this.location.back();
    } else {
      this.router.navigateByUrl(this.url());
    }
  }
}
