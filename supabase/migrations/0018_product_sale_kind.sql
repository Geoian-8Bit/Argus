-- Tipo de artículo: contrato o pieza.
--
-- Sirve para partir las ventas en "venta contratos" y "venta piezas" (y el total
-- como suma de ambas) sin que nadie teclee importes: el tipo vive en el
-- artículo y los importes salen de los movimientos de salida, como hasta ahora.
--
-- Default 'pieza': los productos existentes son material físico.

create type public.sale_kind as enum ('contrato', 'pieza');

alter table public.products
  add column if not exists sale_kind public.sale_kind not null default 'pieza';

-- Vista de métricas: se recrea igual que en 0016 añadiendo el tipo.
drop view if exists public.product_stats;

create view public.product_stats
with (security_invoker = on) as
select
  p.id,
  p.code,
  p.name,
  p.variant,
  p.stock,
  p.archived_at,
  p.warehouse_id,
  p.sale_kind,
  p.price::float8 as price,
  p.min_stock,
  (p.stock > 0 and p.stock <= p.min_stock) as is_low,
  (p.stock = 0) as is_out,
  coalesce(sum(m.qty) filter (where m.type = 'in'), 0)::bigint as total_in,
  coalesce(sum(m.qty) filter (where m.type = 'out'), 0)::bigint as total_out,
  coalesce(
    sum(m.qty * m.unit_price) filter (where m.type = 'out' and m.unit_price is not null),
    0
  )::float8 as total_revenue,
  count(m.id)::bigint as movements_count,
  max(m.created_at) as last_movement_at
from public.products p
left join public.movements m on m.product_id = p.id
group by p.id;

grant select on public.product_stats to authenticated;
