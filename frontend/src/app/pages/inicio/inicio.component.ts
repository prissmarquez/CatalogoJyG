import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { ApiService, Producto } from '../../core/api.service';
import { LINEAS_MENU } from '../../core/lineas';
import { BuscadorComponent } from '../../shared/buscador/buscador.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ImagenProductoComponent } from '../../shared/imagen-producto/imagen-producto.component';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, BuscadorComponent, FooterComponent, ImagenProductoComponent],
  templateUrl: './inicio.component.html',
})
export class InicioComponent {
  protected readonly lineas = LINEAS_MENU;

  // Menú lateral
  protected readonly menuAbierto = signal(false);

  // Los más vendidos (antes mas-vendidos.js)
  protected readonly masVendidos = signal<Producto[]>([]);
  protected readonly estado = signal('Cargando productos…');
  protected readonly mostrarReintentar = signal(false);
  protected readonly anteriorDeshabilitado = signal(true);
  protected readonly siguienteDeshabilitado = signal(true);

  private readonly carrusel = viewChild.required<ElementRef<HTMLElement>>('carrusel');
  private readonly api = inject(ApiService);
  private readonly injector = inject(Injector);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const observer = new ResizeObserver(() => this.actualizarBotones());
      observer.observe(this.carrusel().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });

    this.cargarMasVendidos();
  }

  protected abrirMenu(): void {
    this.menuAbierto.set(true);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  protected cargarMasVendidos(): void {
    this.mostrarReintentar.set(false);
    this.estado.set('Cargando productos…');

    this.api.masVendidos().subscribe({
      next: ({ productos }) => {
        this.masVendidos.set(productos);
        this.estado.set(productos.length ? '' : 'No hay productos seleccionados disponibles.');
        afterNextRender(() => this.actualizarBotones(), { injector: this.injector });
      },
      error: () => {
        this.estado.set('No se pudieron cargar los productos. Intenta de nuevo.');
        this.mostrarReintentar.set(true);
      },
    });
  }

  protected mover(direccion: number): void {
    const track = this.carrusel().nativeElement;
    const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({
      left: direccion * track.clientWidth,
      behavior: reducirMovimiento ? 'instant' : 'smooth',
    });
  }

  protected actualizarBotones(): void {
    const track = this.carrusel().nativeElement;
    this.anteriorDeshabilitado.set(track.scrollLeft <= 2);
    this.siguienteDeshabilitado.set(track.scrollLeft + track.clientWidth >= track.scrollWidth - 2);
  }
}
