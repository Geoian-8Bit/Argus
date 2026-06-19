-- Precios y ventas.
-- products.price = precio base (PVP de referencia) por unidad.
-- movements.unit_price = precio de venta real por unidad (solo salidas);
--   en la app se precarga con el precio base y se puede modificar.

alter table public.products
  add column if not exists price numeric(12, 2) not null default 0 check (price >= 0);

alter table public.movements
  add column if not exists unit_price numeric(12, 2) check (unit_price is null or unit_price >= 0);

-- Vista de métricas por producto: añade precio base e ingresos por ventas.
-- Se castea a float8 para que llegue al cliente como número (numeric viaja como string).
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
