-- Vista de métricas por producto: agrega entradas/salidas/movimientos.
-- security_invoker=on => respeta la RLS del usuario que consulta.
create or replace view public.product_stats
with (security_invoker = on) as
select
  p.id,
  p.code,
  p.name,
  p.variant,
  p.stock,
  p.archived_at,
  coalesce(sum(m.qty) filter (where m.type = 'in'), 0)::bigint as total_in,
  coalesce(sum(m.qty) filter (where m.type = 'out'), 0)::bigint as total_out,
  count(m.id)::bigint as movements_count,
  max(m.created_at) as last_movement_at
from public.products p
left join public.movements m on m.product_id = p.id
group by p.id;

grant select on public.product_stats to authenticated;
