-- Orden manual de la lista de productos (arrastrar y soltar en la app).
-- position es un entero global; dentro de cada grupo (o en "Sin grupo") los
-- productos se muestran ordenados por su position ascendente. Al reordenar un
-- subconjunto solo se reasignan las positions ya usadas por ese subconjunto,
-- así que nunca colisionan con las de otros productos.

alter table public.products
  add column if not exists position integer;

-- Orden inicial: el mismo que ya se veía (alfabético), para que activar esta
-- función no reordene nada hasta que alguien arrastre manualmente.
with ordered as (
  select id, row_number() over (order by name asc, created_at asc) - 1 as rn
  from public.products
)
update public.products p
set position = ordered.rn
from ordered
where ordered.id = p.id
  and p.position is null;

create index if not exists products_position_idx on public.products (position);

-- Asigna automáticamente la siguiente posición a los productos nuevos que no
-- la traigan indicada, para que aparezcan al final de la lista.
create or replace function public.assign_next_product_position()
returns trigger
language plpgsql
as $$
begin
  if new.position is null then
    select coalesce(max(position), -1) + 1 into new.position from public.products;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_products_assign_position on public.products;
create trigger trg_products_assign_position
before insert on public.products
for each row execute function public.assign_next_product_position();
