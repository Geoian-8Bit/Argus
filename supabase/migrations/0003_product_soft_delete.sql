-- Borrado lógico de productos: "Eliminar" archiva (oculta) sin perder el
-- histórico de movimientos que referencia al producto.
alter table public.products
  add column if not exists archived_at timestamptz;

create index if not exists products_active_idx
  on public.products (archived_at)
  where archived_at is null;
