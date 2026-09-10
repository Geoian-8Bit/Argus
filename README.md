# Argus

PWA de gestión de inventario por escaneo de códigos QR, pensada para almacenes cuyos movimientos de stock los registran personas en ruta desde el móvil.

> Producto propio: diseñado y desarrollado en solitario, **vendido e implantado en una empresa**, donde está en uso a diario. Sigo añadiéndole funcionalidades y dándole mantenimiento.

## El problema

En un almacén que reparte, el stock real y el stock registrado se separan a lo largo del día: el material sale con el repartidor, se entrega, se devuelve o se cambia, y la anotación llega horas después —o no llega—. Cuando el registro se hace luego, de memoria y sobre papel, el desfase ya es irrecuperable.

Argus mueve el registro al momento y al sitio donde ocurre el movimiento: el operario escanea el QR del producto con su propio móvil y confirma la cantidad. El stock lo actualiza la base de datos en el mismo instante, y cada movimiento queda firmado con quién, cuándo y en qué almacén.

## Capturas

<!-- TODO: GIF de 8s escaneando un QR y viendo bajar el stock. Guardar en docs/media/scan.gif -->
<!-- TODO: captura del listado de productos con avisos de stock bajo. Guardar en docs/media/productos.png -->
<!-- TODO: captura de la hoja de etiquetas QR generada en PDF. Guardar en docs/media/etiquetas-qr.png -->
<!-- TODO: captura del panel, con ventas del día y stock bajo. Guardar en docs/media/panel.png -->

## Funcionalidades

### Escaneo y movimientos

- Lectura de QR con la cámara del móvil (`html5-qrcode`), acotada al almacén activo.
- Registro manual sin escanear para el rol comercial, que trabaja fuera del almacén.
- El stock **no lo calcula el cliente**: un trigger de Postgres (`apply_movement_to_stock`) lo aplica al insertar el movimiento, bloquea la fila del producto con `select ... for update` para serializar dos salidas simultáneas, y rechaza tanto las salidas que dejarían el stock negativo como las que apuntan a un producto desactivado.
- Los movimientos son un libro de sólo-inserción: tipo (`in`/`out`), cantidad, usuario, cliente, precio unitario y nota.

### Catálogo y etiquetas QR

- Productos con código único por almacén, variante, precio, `min_stock` para los avisos y tipo de venta (`contrato` / `pieza`).
- Grupos de productos y orden manual por arrastre (`@dnd-kit`), persistido en columnas `position`.
- Archivado reversible y desactivación de productos sin borrar el histórico.
- Generación de etiquetas: QR por producto y exportación a PDF en rejilla A4 apaisada de 4×2 (8 etiquetas por hoja) con `qrcode` + `jsPDF`, para imprimir y pegar en la estantería.

### Multi-almacén y roles

- Almacenes independientes, sin jerarquía: cada uno con sus productos, grupos y movimientos.
- `warehouse_members` define quién accede a qué; un admin accede a todos sin estar en la tabla.
- Toda la autorización vive en **RLS de Postgres**, apoyada en `can_access_warehouse()` (`security definer` y `search_path` fijo, para evitar la recursión de políticas y el secuestro de esquema).
- Tres roles con navegación propia: `admin` (inventario y usuarios), `staff` (escaneo y ficha de furgoneta) y `comercial` (registro manual y sus ventas).
- Alta y baja de usuarios desde la app mediante Edge Functions (`admin-create-user`, `admin-delete-user`), porque requieren la `service_role`, que no puede vivir en el navegador.

### Panel

- Ventas del día y del periodo, actividad reciente y productos por debajo de `min_stock`.
- Métricas por producto sobre la vista `product_stats`, creada con `security_invoker = on` para que respete la RLS de quien consulta en lugar de saltársela.

### Ficha de furgoneta

- Checklist de material que rellenan los repartidores. Se guarda como `jsonb`, con autor y fecha atribuidos en el servidor. Cada uno ve las suyas; el admin las ve todas.

### PWA

- Instalable en el móvil desde el navegador, en modo `standalone` y orientación vertical.
- Service worker con Workbox (`registerType: 'autoUpdate'`): precachea el shell y los estáticos, así que la app abre sin red y se actualiza sola al publicar.
- El trabajo con datos **sí requiere conexión**. La cola offline sobre IndexedDB está en el roadmap, no implementada.

### Entrega continua

- GitHub Actions: instalación cacheada una sola vez y, a partir de ahí, lint, formato, typecheck, tests con cobertura y build de Vite en paralelo. Despliegue a Vercel sólo con todo en verde y push a `main`.
- Workflow programado que hace ping a la API REST de Supabase cada 3 días para que el proyecto no se pause por inactividad.

## Decisiones técnicas

**El stock lo calcula la base de datos, no la aplicación.** La alternativa era leer el stock, restar en el cliente y escribir el resultado. Se descartó: dos móviles registrando salidas del mismo producto a la vez se pisan, y con varios clientes (la app, un futuro panel de escritorio, scripts) la regla habría que repetirla en cada uno. En un trigger con bloqueo de fila la regla es una sola, es transaccional y nadie puede saltársela.

**Autorización en RLS de Postgres, sin backend propio.** La alternativa era una API en Node por delante de la base de datos. Para un equipo de una persona, mantener un servicio más era coste sin retorno: el cliente habla directo con Supabase y quién ve qué se decide en políticas SQL. El precio asumido es que la lógica de acceso se escribe en SQL y se prueba peor que en TypeScript, y que las funciones de apoyo hay que endurecerlas a mano (`security definer` con `search_path` fijo). Lo que no cabe en RLS —crear y borrar usuarios— vive en Edge Functions, lo único que toca la `service_role`.

**Los movimientos son un libro de sólo-inserción y el stock es su consecuencia.** Se podría haber editado `products.stock` directamente y ahorrarse una tabla. Pero el valor del sistema para el cliente no es el número de stock: es poder responder quién sacó qué, cuándo y para qué cliente cuando el recuento no cuadra. Un histórico inmutable responde a eso; un contador editable, no.

**PWA instalable en lugar de aplicación nativa.** Los usuarios trabajan con su propio móvil, mezclando Android e iOS. Una nativa habría dado mejor acceso a la cámara e impresión directa a etiqueta térmica, pero también dos bases de código, cuentas de desarrollador y una tienda entre cada corrección y el usuario. Con una PWA se instala desde un enlace y una corrección llega al minuto siguiente. Se sacrificó el acceso pleno al hardware y el trabajo offline con datos.

**Almacenes planos en lugar de jerarquía.** La idea se pidió como "subalmacenes" del almacén principal. Al concretarla no apareció ninguna operación que necesitase la jerarquía: lo único que cambiaba entre uno y otro era quién accede. Modelar acceso (`warehouse_members`) en vez de árbol quitó de en medio las consultas recursivas y las políticas RLS transitivas.

## Stack

- **Frontend:** React 19 + Vite + TypeScript
- **UI:** Tailwind CSS con una librería de componentes propia (`src/components/ui`)
- **PWA:** `vite-plugin-pwa` (Workbox)
- **Escaneo QR:** `html5-qrcode` · **Generación de QR y etiquetas:** `qrcode` + `jsPDF`
- **Estado servidor:** TanStack Query · **Estado local:** Zustand
- **Backend:** Supabase (Postgres + Auth + RLS + Edge Functions)
- **Tests:** Vitest + Testing Library
- **CI/CD:** GitHub Actions + Vercel

## Puesta en marcha

```bash
npm install
cp .env.example .env   # rellenar con los datos de Supabase
npm run dev
```

App accesible en <http://localhost:5173>.

Las migraciones de `supabase/migrations/` y las Edge Functions se aplican con la CLI de Supabase; el despliegue automático sólo publica el frontend.

## Scripts

| Comando                 | Descripción                                         |
| ----------------------- | --------------------------------------------------- |
| `npm run dev`           | Servidor de desarrollo con HMR.                     |
| `npm run build`         | Build de producción (typecheck + Vite build + PWA). |
| `npm run preview`       | Previsualiza el build.                              |
| `npm run lint`          | ESLint sobre todo el repo.                          |
| `npm run typecheck`     | `tsc --noEmit`.                                     |
| `npm test`              | Vitest una vez.                                     |
| `npm run test:watch`    | Vitest en watch.                                    |
| `npm run test:coverage` | Vitest con informe de cobertura.                    |
| `npm run format`        | Prettier escribe los archivos.                      |
| `npm run format:check`  | Prettier solo comprueba.                            |

## Estructura

```
src/
├── components/
│   ├── auth/       # Guardas de ruta (RequireAuth, RequireAdmin)
│   ├── layout/     # AppShell, BottomNav por rol
│   └── ui/         # Componentes base propios sobre Tailwind
├── features/
│   ├── auth/       # Login, sesión, rol
│   ├── scan/       # Cámara + lectura QR
│   ├── products/   # Catálogo, grupos, orden, etiquetas QR
│   ├── movements/  # Registro e historial de movimientos
│   ├── warehouses/ # Almacén activo y administración
│   ├── dashboard/  # Ventas, actividad y avisos de stock
│   ├── checklist/  # Ficha de material en furgoneta
│   └── users/      # Alta, baja y roles (vía Edge Functions)
├── hooks/
├── lib/
│   ├── supabase.ts       # Cliente Supabase tipado
│   ├── database.types.ts # Tipos generados con la CLI de Supabase
│   ├── qr.ts             # Generación de QR
│   ├── qrPdf.ts          # Hoja de etiquetas en PDF
│   └── utils.ts
├── pages/
└── main.tsx, App.tsx, index.css

supabase/
├── migrations/   # Esquema, RLS, triggers y vistas
├── functions/    # Edge Functions de administración de usuarios
├── seed.sql
└── config.toml

.github/workflows/
├── ci.yml                  # Calidad + tests + build + deploy
└── supabase-keepalive.yml  # Ping programado al proyecto de Supabase
```

## Modelo de datos

- **`warehouses`** — almacenes independientes. Cada uno tiene sus propios productos y movimientos; no hay jerarquía entre ellos.
- **`warehouse_members`** — quién accede a qué almacén. Un admin accede a todos sin estar aquí.
- **`products`** — `warehouse_id`, `code` (único dentro del almacén), `name`, `variant`, `stock`, `price`, `min_stock`, `sale_kind` (`contrato|pieza`), `notes`.
- **`movements`** — `warehouse_id`, `product_id`, `type` (`in|out`), `qty`, `user_id`, `customer`, `unit_price`, `note`.
- **`profiles`** — `role`: `admin`, `staff` o `comercial`.
- **`van_checklists`** — revisiones de material en furgoneta (`jsonb`), con autor y fecha.
- Trigger `apply_movement_to_stock` actualiza `products.stock` al insertar un movimiento; `set_movement_warehouse` copia el almacén desde el producto.

## Tests

```bash
npm test              # una pasada
npm run test:coverage # con informe de cobertura
```

Vitest sobre jsdom con Testing Library. Las pruebas cubren la lógica pura extraída de los componentes —cálculo de ventas por periodo, reordenación de productos y grupos, agrupación del listado, selección de almacén y maquetación de la hoja de etiquetas—, porque el job de CI no tiene credenciales de Supabase y no puede montar nada que importe el cliente real.

## Roadmap

1. Artículos especiales de los comerciales (margen). <!-- TODO: pendiente de definir con el cliente -->
2. Informe diario exportable con el formato del parte en papel actual. <!-- TODO: falta la plantilla del cliente -->
3. Cola offline con IndexedDB para registrar movimientos sin cobertura.
4. Impresión directa a etiqueta térmica.

---

El nombre viene de Argos Panoptes, el gigante de los cien ojos de la mitología griega: el que todo lo vigila, como un escáner que mantiene el inventario bajo control.
