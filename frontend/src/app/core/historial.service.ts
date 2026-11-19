import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Sabe si el usuario ya navegó dentro del catálogo. Reemplaza la revisión de
 * `document.referrer` de navegacion.js, que en una SPA no cambia entre páginas.
 */
@Injectable({ providedIn: 'root' })
export class HistorialService {
  private navegaciones = 0;

  constructor() {
    inject(Router).events
      .pipe(filter(evento => evento instanceof NavigationEnd))
      .subscribe(() => this.navegaciones++);
  }

  /** true cuando la página actual se abrió desde otra página del catálogo. */
  get vieneDelCatalogo(): boolean {
    return this.navegaciones > 1;
  }
}
