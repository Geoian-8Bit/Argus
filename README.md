# Argus

PWA para gestión de stock y logística por escaneo de códigos QR. El nombre rinde homenaje a Argos Panoptes, el gigante de los cien ojos de la mitología griega: el que todo lo vigila — como un escáner que mantiene el inventario bajo control.

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

## Modelo de datos

- **`warehouses`** — almacenes independientes. Cada uno tiene sus propios productos y movimientos; no hay jerarquía entre ellos.
- **`warehouse_members`** — quién accede a qué almacén. Un admin accede a todos sin estar aquí.
- **`products`** — `warehouse_id`, `code` (único dentro del almacén), `name`, `variant`, `stock`, `price`, `min_stock`, `sale_kind` (`contrato|pieza`), `notes`.
- **`movements`** — `warehouse_id`, `product_id`, `type` (`in|out`), `qty`, `user_id`, `customer`, `unit_price`, `note`.
- **`profiles`** — `role`: `admin`, `staff` o `comercial`.
- Trigger `apply_movement_to_stock` actualiza `products.stock` al insertar un movimiento; `set_movement_warehouse` copia el almacén desde el producto.

## Próximos pasos

1. Artículos especiales de los comerciales (margen). Pendiente de definir con Nerea; ver `docs/subalmacenes-comerciales.md`.
2. Informe diario en la app, exportable con el formato del papel actual. Pendiente de conseguir la plantilla.
3. (v2) Soporte offline con IndexedDB.
4. (v2) Impresión a etiqueta térmica.

## Documentación de referencia

- Análisis y decisiones previas: `C:\Users\iangi\Desktop\resumen-proyecto-stock.md`.
- Plan de bootstrap: `C:\Users\iangi\.claude\plans\c-users-iangi-desktop-resumen-proyecto-s-abundant-fern.md`.
