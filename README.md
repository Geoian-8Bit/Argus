# QR Stock

PWA para gestión de stock por escaneo de códigos QR. Pensada para resolver desfases de inventario en almacenes donde los movimientos los registran personas en ruta.

## Stack

- **Frontend:** React 19 + Vite + TypeScript
- **UI:** Tailwind CSS (preparado para shadcn/ui)
- **PWA:** `vite-plugin-pwa` (Workbox)
- **Escaneo QR:** `html5-qrcode`
- **Generación QR:** `qrcode`
- **Estado servidor:** TanStack Query
- **Backend:** Supabase (Postgres + Auth + RLS)
- **Tests:** Vitest + Testing Library

## Puesta en marcha

```bash
npm install
cp .env.example .env   # rellenar con los datos de Supabase
npm run dev
```

App accesible en <http://localhost:5173>.

## Scripts

| Comando                | Descripción                                         |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo con HMR.                     |
| `npm run build`        | Build de producción (typecheck + Vite build + PWA). |
| `npm run preview`      | Previsualiza el build.                              |
| `npm run lint`         | ESLint sobre todo el repo.                          |
| `npm run typecheck`    | `tsc --noEmit`.                                     |
| `npm test`             | Vitest una vez.                                     |
| `npm run test:watch`   | Vitest en watch.                                    |
| `npm run format`       | Prettier escribe los archivos.                      |
| `npm run format:check` | Prettier solo comprueba.                            |

## Estructura

```
src/
├── components/
│   ├── layout/     # AppShell, BottomNav
│   └── ui/         # Componentes shadcn (a poblar)
├── features/
│   ├── auth/       # Login, sesión
│   ├── scan/       # Cámara + lectura QR
│   ├── products/   # CRUD productos
│   └── movements/  # Movimientos de stock
├── hooks/
├── lib/
│   ├── supabase.ts       # Cliente Supabase tipado
│   ├── database.types.ts # Tipos generados (manual hoy, generar con CLI)
│   ├── qr.ts             # Generación de QR
│   └── utils.ts          # cn() helper
├── pages/
└── main.tsx, App.tsx, index.css

supabase/
├── migrations/0001_init.sql  # Tablas products + movements + RLS
├── seed.sql
└── config.toml

.github/workflows/ci.yml      # Lint + typecheck + tests + build
```

## Modelo de datos (esquema inicial)

- **`products`** — `code` (único), `name`, `variant`, `stock`, `notes`.
- **`movements`** — `product_id`, `type` (`in|out`), `qty`, `user_id`, `note`.
- Trigger `apply_movement_to_stock` actualiza `products.stock` al insertar un movimiento.

## Próximos pasos

1. Crear el proyecto en Supabase y aplicar la migración (vía MCP o `supabase` CLI).
2. Generar tipos reales: `supabase gen types typescript --project-id <ref> > src/lib/database.types.ts`.
3. Implementar pantalla de Login (Supabase Auth).
4. Implementar `ScanPage` con `html5-qrcode` y conexión al cliente Supabase.
5. Implementar CRUD de productos y registro de movimientos.
6. Generación + visualización del QR del producto.
7. (v2) Soporte offline con IndexedDB.
8. (v2) Impresión a etiqueta térmica.

## Documentación de referencia

- Análisis y decisiones previas: `C:\Users\iangi\Desktop\resumen-proyecto-stock.md`.
- Plan de bootstrap: `C:\Users\iangi\.claude\plans\c-users-iangi-desktop-resumen-proyecto-s-abundant-fern.md`.
