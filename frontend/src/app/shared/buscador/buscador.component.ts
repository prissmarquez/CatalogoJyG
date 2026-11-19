import { Component, DestroyRef, ElementRef, HostListener, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, catchError, of, switchMap } from 'rxjs';

import { ApiService, ResultadoBusqueda } from '../../core/api.service';

/**
 * Buscador global de la barra de navegación.
 * Se aplica como atributo sobre `<div class="search-wrap">` para no agregar
 * elementos extra al DOM (el CSS del navbar depende de esa estructura).
 *
 * - `modo="inicio"`: hasta 10 resultados y se oculta si no hay coincidencias.
 * - `modo="general"`: hasta 20 resultados y avisa cuando no hay coincidencias.
 */
@Component({
  selector: '[appBuscador]',
  imports: [RouterLink],
  template: `
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>

    <input type="text" id="searchInput" placeholder="Buscar productos..." (input)="buscar($event)">

    <div id="searchResults" class="search-results" [style.display]="visible() ? 'block' : 'none'">
      @if (sinResultados()) {
        <div class="search-result-item">No se encontraron resultados</div>
      }
      @for (producto of resultados(); track $index) {
        <a
          class="search-result-item"
          routerLink="/producto"
          [queryParams]="{ linea: producto.linea, clave: producto.Clave }"
        >
          <strong>{{ producto.Nombre }}</strong>
          <div class="search-result-line">{{ producto.linea }}</div>
        </a>
      }
    </div>
  `,
})
export class BuscadorComponent {
  readonly modo = input<'inicio' | 'general'>('general');

  protected readonly resultados = signal<ResultadoBusqueda[]>([]);
  protected readonly sinResultados = signal(false);
  protected readonly visible = signal(false);

  private readonly api = inject(ApiService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly textos = new Subject<string>();

  constructor() {
    this.textos
      .pipe(
        switchMap(texto => {
          if (texto.length < 2) return of(null);
          return this.api.buscar(texto).pipe(
            catchError(error => {
              console.error('ERROR SEARCH:', error);
              return of([] as ResultadoBusqueda[]);
            }),
          );
        }),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(productos => this.mostrar(productos));
  }

  protected buscar(evento: Event): void {
    this.textos.next((evento.target as HTMLInputElement).value.trim());
  }

  private mostrar(productos: ResultadoBusqueda[] | null): void {
    if (productos === null) {
      this.resultados.set([]);
      this.sinResultados.set(false);
      this.visible.set(false);
      return;
    }

    if (this.modo() === 'inicio') {
      this.resultados.set(productos.slice(0, 10));
      this.sinResultados.set(false);
      this.visible.set(productos.length > 0);
      return;
    }

    this.resultados.set(productos);
    this.sinResultados.set(productos.length === 0);
    this.visible.set(true);
  }

  /** Cerrar resultados al hacer clic fuera del buscador. */
  @HostListener('document:click', ['$event'])
  protected cerrarAlHacerClicFuera(evento: MouseEvent): void {
    if (!this.host.nativeElement.contains(evento.target as Node)) {
      this.visible.set(false);
    }
  }
}
