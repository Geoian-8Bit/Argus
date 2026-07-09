-- Grupos de productos.
-- product_groups agrupa productos para mostrarlos en acordeón en el listado.
-- products.group_id es opcional: los productos sin grupo se listan bajo "Sin grupo".

create table public.product_groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- Único sin distinguir mayúsculas para evitar duplicados tipo "Almohadas"/"almohadas".
create unique index product_groups_name_key on public.product_groups (lower(name));

alter table public.products
  add column if not exists group_id uuid references public.product_groups(id) on delete set null;

create index products_group_idx on public.products (group_id);

-- RLS abierta a usuarios autenticados, igual que products (la UI restringe a admin).
alter table public.product_groups enable row level security;

create policy "product_groups: read for authenticated"
  on public.product_groups for select to authenticated using (true);

create policy "product_groups: insert for authenticated"
  on public.product_groups for insert to authenticated with check (true);

create policy "product_groups: update for authenticated"
  on public.product_groups for update to authenticated using (true) with check (true);

create policy "product_groups: delete for authenticated"
  on public.product_groups for delete to authenticated using (true);
