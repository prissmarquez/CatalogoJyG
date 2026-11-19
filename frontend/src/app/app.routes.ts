import { Routes } from '@angular/router';

import { InicioComponent } from './pages/inicio/inicio.component';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { LineaComponent } from './pages/linea/linea.component';
import { ProductoComponent } from './pages/producto/producto.component';
import { PromocionesComponent } from './pages/promociones/promociones.component';

export const routes: Routes = [
  { path: '', component: InicioComponent, title: 'Materiales JyG' },
  { path: 'catalogo', component: CatalogoComponent, title: 'Catálogo | Materiales JyG' },
  // Línea y producto ponen su propio título (nombre de la línea / del producto).
  { path: 'linea', component: LineaComponent },
  { path: 'producto', component: ProductoComponent },
  { path: 'promociones', component: PromocionesComponent, title: 'Promociones | Materiales JyG' },

  // Direcciones del sitio anterior (*.html): siguen funcionando, conservando ?linea= y ?clave=
  { path: 'index.html', redirectTo: '', pathMatch: 'full' },
  { path: 'catalogo.html', redirectTo: 'catalogo', pathMatch: 'full' },
  { path: 'linea.html', redirectTo: 'linea', pathMatch: 'full' },
  { path: 'producto.html', redirectTo: 'producto', pathMatch: 'full' },
  { path: 'promociones.html', redirectTo: 'promociones', pathMatch: 'full' },

  // Igual que el servidor original: cualquier otra ruta muestra el inicio.
  { path: '**', component: InicioComponent, title: 'Materiales JyG' },
];
