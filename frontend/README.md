# Frontend — Catálogo Materiales JyG

Aplicación Angular del catálogo. Las instrucciones generales están en el
[README principal](../README.md).

```
src/app/
├── core/      Servicios y datos: API, historial de navegación, listas de líneas
├── shared/    Piezas reutilizables: buscador, botón Volver, footer, WhatsApp, imagen de producto
└── pages/     Una carpeta por página: inicio, catalogo, linea, producto, promociones
src/assets/     Logos e imágenes
src/styles.css Estilos globales del sitio
```

Comandos (desde esta carpeta):

- `npm start` — servidor de desarrollo en http://localhost:4200 (las llamadas a `/api` van al backend en el puerto 3000)
- `npm run build` — compila a `dist/browser`, que es lo que sirve el backend
- `npm test` — pruebas
