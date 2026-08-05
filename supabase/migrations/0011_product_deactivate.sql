-- Desactivar productos sin archivarlos.
-- Un producto con stock = -1 se considera "no se utiliza": no cuenta como
-- stock bajo ni agotado, y no se puede registrar movimientos sobre él hasta
-- reactivarlo (asignándole un stock real >= 0). Es distinto de archivar: un
-- producto desactivado sigue siendo un producto "vivo" que simplemente no se
-- usa por ahora, mientras que archivar es un borrado lógico.

alter table public.products
  drop constraint if exists products_stock_check;

alter table public.products
  add constraint products_stock_check check (stock >= -1);

-- Vista de métricas: separa "sin stock" (is_out) de "quedan pocos" (is_low).
-- Ambos excluyen automáticamente stock = -1 (no es > 0 ni = 0).
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
