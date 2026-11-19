import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HistorialService } from './core/historial.service';
import { WhatsappComponent } from './shared/whatsapp/whatsapp.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WhatsappComponent],
  template: `
    <router-outlet />
    <app-whatsapp />
  `,
})
export class AppComponent {
  // Se crea al arrancar para contar desde la primera navegación.
  private readonly historial = inject(HistorialService);
}
