-- Almacenes independientes.
--
-- Hasta ahora había un único almacén implícito: todo usuario autenticado veía
-- todos los productos y todos los movimientos. Ahora cada almacén es
-- independiente y tiene sus propios productos, grupos y movimientos; no hay
-- jerarquía entre ellos (no son "subalmacenes" de un almacén padre, aunque así
-- se llamó a la idea al describirla).
--
-- Quién ve qué:
--   * warehouse_members dice a qué almacenes accede cada usuario.
--   * Un admin accede a todos sin necesidad de estar en warehouse_members.
--
-- Los datos existentes se migran al almacén "Almacén principal", y todos los
-- usuarios actuales pasan a ser miembros suyo, para que nadie pierda acceso.

-- ---------------------------------------------------------------------------
-- 1) Tablas
-- ---------------------------------------------------------------------------

create table public.warehouses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  position    integer,
  created_at  timestamptz not null default now(),
  archived_at timestamptz
);

-- Único sin distinguir mayúsculas, igual que en product_groups.
create unique index warehouses_name_key on public.warehouses (lower(name));

create table public.warehouse_members (
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (warehouse_id, user_id)
);

create index warehouse_members_user_idx on public.warehouse_members (user_id);

-- ---------------------------------------------------------------------------
-- 2) Helper de acceso
-- ---------------------------------------------------------------------------

-- security definer a propósito: las políticas de warehouse_members usan esta
-- función, y si leyese la tabla con RLS activa la comprobación se llamaría a sí
-- misma. Con definer la lectura interna salta RLS y no hay recursión.
create or replace function public.can_access_warehouse(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select target is not null and (
    public.is_admin()
    or exists (
      select 1
        from public.warehouse_members wm
       where wm.warehouse_id = target
         and wm.user_id = auth.uid()
    )
  );
$$;

grant execute on function public.can_access_warehouse(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 3) Almacén principal + columnas warehouse_id
-- ---------------------------------------------------------------------------

insert into public.warehouses (name, position) values ('Almacén principal', 0);

alter table public.products
  add column if not exists warehouse_id uuid references public.warehouses(id) on delete restrict;

alter table public.product_groups
  add column if not exists warehouse_id uuid references public.warehouses(id) on delete cascade;

-- En movements se guarda denormalizado (en vez de leerlo del producto) para que
-- las políticas RLS del histórico no tengan que hacer un join por fila.
alter table public.movements
  add column if not exists warehouse_id uuid references public.warehouses(id) on delete restrict;

update public.products
   set warehouse_id = (select id from public.warehouses where lower(name) = 'almacén principal')
 where warehouse_id is null;

update public.product_groups
   set warehouse_id = (select id from public.warehouses where lower(name) = 'almacén principal')
 where warehouse_id is null;

update public.movements
   set warehouse_id = (select id from public.warehouses where lower(name) = 'almacén principal')
 where warehouse_id is null;

alter table public.products      alter column warehouse_id set not null;
alter table public.product_groups alter column warehouse_id set not null;
alter table public.movements     alter column warehouse_id set not null;

create index products_warehouse_idx on public.products (warehouse_id);
create index product_groups_warehouse_idx on public.product_groups (warehouse_id);
create index movements_warehouse_idx on public.movements (warehouse_id, created_at desc);

-- Todos los usuarios actuales siguen viendo lo de siempre.
insert into public.warehouse_members (warehouse_id, user_id)
select (select id from public.warehouses where lower(name) = 'almacén principal'), p.id
  from public.profiles p
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 4) Unicidad por almacén
-- ---------------------------------------------------------------------------

-- El código deja de ser único global y pasa a serlo dentro de cada almacén: dos
-- almacenes independientes pueden usar el mismo código sin saberlo, y quien crea
-- el producto no puede ver el conflicto porque no accede al otro almacén. La
-- búsqueda por código (escaneo) filtra siempre por almacén, así que no hay
-- ambigüedad.
alter table public.products drop constraint if exists products_code_key;
create unique index products_warehouse_code_key on public.products (warehouse_id, code);

drop index if exists public.product_groups_name_key;
create unique index product_groups_warehouse_name_key
  on public.product_groups (warehouse_id, lower(name));

-- ---------------------------------------------------------------------------
-- 5) El movimiento hereda el almacén de su producto
-- ---------------------------------------------------------------------------

create or replace function public.set_movement_warehouse()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  product_warehouse uuid;
begin
  select p.warehouse_id into product_warehouse
    from public.products p
   where p.id = new.product_id;

  if not found then
    raise exception 'Producto % no existe', new.product_id;
  end if;

  -- Se ignora lo que mande el cliente: manda el producto.
  new.warehouse_id := product_warehouse;
  return new;
end;
$$;

create trigger trg_movements_set_warehouse
before insert on public.movements
for each row execute function public.set_movement_warehouse();

-- ---------------------------------------------------------------------------
-- 6) RLS por almacén
-- ---------------------------------------------------------------------------

alter table public.warehouses enable row level security;
alter table public.warehouse_members enable row level security;

create policy "warehouses: read accessible"
  on public.warehouses for select to authenticated
  using (public.can_access_warehouse(id));

create policy "warehouses: admin insert"
  on public.warehouses for insert to authenticated
  with check (public.is_admin());

create policy "warehouses: admin update"
  on public.warehouses for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "warehouses: admin delete"
  on public.warehouses for delete to authenticated
  using (public.is_admin());

create policy "warehouse_members: read own or admin"
  on public.warehouse_members for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "warehouse_members: admin insert"
  on public.warehouse_members for insert to authenticated
  with check (public.is_admin());

create policy "warehouse_members: admin delete"
  on public.warehouse_members for delete to authenticated
  using (public.is_admin());

drop policy if exists "products: read for authenticated" on public.products;
drop policy if exists "products: write for authenticated" on public.products;
drop policy if exists "products: update for authenticated" on public.products;

create policy "products: read own warehouses"
  on public.products for select to authenticated
  using (public.can_access_warehouse(warehouse_id));

create policy "products: insert own warehouses"
  on public.products for insert to authenticated
  with check (public.can_access_warehouse(warehouse_id));

-- El using y el with check son el mismo almacén: no se puede mover un producto
-- de un almacén al que se accede a otro al que no.
create policy "products: update own warehouses"
  on public.products for update to authenticated
  using (public.can_access_warehouse(warehouse_id))
  with check (public.can_access_warehouse(warehouse_id));

drop policy if exists "product_groups: read for authenticated" on public.product_groups;
drop policy if exists "product_groups: insert for authenticated" on public.product_groups;
drop policy if exists "product_groups: update for authenticated" on public.product_groups;
drop policy if exists "product_groups: delete for authenticated" on public.product_groups;

create policy "product_groups: read own warehouses"
  on public.product_groups for select to authenticated
  using (public.can_access_warehouse(warehouse_id));

create policy "product_groups: insert own warehouses"
  on public.product_groups for insert to authenticated
  with check (public.can_access_warehouse(warehouse_id));

create policy "product_groups: update own warehouses"
  on public.product_groups for update to authenticated
  using (public.can_access_warehouse(warehouse_id))
  with check (public.can_access_warehouse(warehouse_id));

create policy "product_groups: delete own warehouses"
  on public.product_groups for delete to authenticated
  using (public.can_access_warehouse(warehouse_id));

drop policy if exists "movements: read for authenticated" on public.movements;
drop policy if exists "movements: insert as self" on public.movements;

create policy "movements: read own warehouses"
  on public.movements for select to authenticated
  using (public.can_access_warehouse(warehouse_id));

-- warehouse_id lo pone el trigger BEFORE INSERT a partir del producto, y el
-- with check se evalúa sobre la fila ya modificada.
create policy "movements: insert as self in own warehouses"
  on public.movements for insert to authenticated
  with check (user_id = auth.uid() and public.can_access_warehouse(warehouse_id));

-- ---------------------------------------------------------------------------
-- 7) Vista de métricas con almacén
-- ---------------------------------------------------------------------------

-- security_invoker = on: la vista hereda las políticas de products/movements,
-- así que cada usuario solo ve las filas de sus almacenes.
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
