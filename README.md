# Catálogo Materiales JyG

Catálogo de productos en línea. Los productos se leen de Google Sheets.

## Estructura

```
catalogo/
├── backend/            Servidor Express (API + sirve el frontend compilado)
│   ├── server.js
│   ├── .env            Variables de entorno (no se sube a git)
│   └── config/
│       ├── mas-vendidos.json   Claves de "Los más vendidos"
│       ├── promociones.json    Promociones del mes
│       └── google-credentials.json (no se sube a git)
├── frontend/           Aplicación Angular (ver frontend/README.md)
├── data/               Archivos de trabajo (no se suben a git)
└── package.json        Scripts del proyecto
```

## Comandos

Desde la carpeta principal:

- `npm install` — instala las dependencias y compila el frontend automáticamente
- `npm run build` — vuelve a compilar el frontend
- `npm start` — inicia el servidor en http://localhost:3000

Para desarrollar el frontend con recarga automática: `npm start` en una terminal
y `npm run dev:frontend` en otra, y abre http://localhost:4200.

Al publicar basta con `npm install` (compila el frontend) y `npm start`.
