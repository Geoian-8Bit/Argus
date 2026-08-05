-- Orden manual de los grupos de productos (arrastrar y soltar en la app).
-- Mismo planteamiento que products.position: entero global, y al reordenar
-- solo se reasignan las positions que ya usaba el propio conjunto movido.

alter table public.product_groups
  add column if not exists position integer;

-- Orden inicial: el alfabético que ya se veía, para que activar esta función
-- no recoloque nada hasta que alguien arrastre a mano.
with ordered as (
  select id, row_number() over (order by name asc, created_at asc) - 1 as rn
  from public.product_groups
)
update public.product_groups g
set position = ordered.rn
from ordered
where ordered.id = g.id
  and g.position is null;

create index if not exists product_groups_position_idx on public.product_groups (position);

-- Los grupos nuevos van al final de la lista.
create or replace function public.assign_next_group_position()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.position is null then
    select coalesce(max(g.position), -1) + 1 into new.position from public.product_groups g;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_product_groups_assign_position on public.product_groups;
create trigger trg_product_groups_assign_position
before insert on public.product_groups
for each row execute function public.assign_next_group_position();
