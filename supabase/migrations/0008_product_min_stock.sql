-- Umbral de stock bajo por producto.
-- products.min_stock = nivel a partir del cual (igual o menos) el producto se
-- considera "quedan pocos" (rojo). Por encima del umbral va en verde.
-- Default 5 = el umbral global anterior, para conservar el comportamiento.

alter table public.products
  add column if not exists min_stock integer not null default 5 check (min_stock >= 0);

-- Vista de métricas: expone el umbral y un flag is_low (stock>0 y <= umbral)
-- para poder contar productos bajo umbral sin comparar columnas en el cliente.
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
  p.price::float8 as price,
  p.min_stock,
  (p.stock > 0 and p.stock <= p.min_stock) as is_low,
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
