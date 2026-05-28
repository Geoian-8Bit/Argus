-- QR Stock — esquema inicial.
-- Tablas: products, movements. RLS habilitada y abierta a usuarios autenticados.
-- Endurecer las políticas (por rol/empresa) cuando se defina el modelo de usuarios.

create extension if not exists "pgcrypto";

create type public.movement_type as enum ('in', 'out');

create table public.products (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  variant     text,
  stock       integer not null default 0 check (stock >= 0),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index products_code_idx on public.products (code);
create index products_name_idx on public.products using gin (to_tsvector('simple', name));

create table public.movements (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete restrict,
  type        public.movement_type not null,
  qty         integer not null check (qty > 0),
  user_id     uuid references auth.users(id) on delete set null,
  note        text,
  created_at  timestamptz not null default now()
);

create index movements_product_idx on public.movements (product_id, created_at desc);
create index movements_created_at_idx on public.movements (created_at desc);

-- Mantiene products.stock consistente con la suma de movimientos.
create or replace function public.apply_movement_to_stock()
returns trigger
language plpgsql
as $$
declare
  delta integer;
begin
  delta := case new.type when 'in' then new.qty else -new.qty end;

  update public.products
     set stock = stock + delta,
         updated_at = now()
   where id = new.product_id;

  if not found then
    raise exception 'Producto % no existe', new.product_id;
  end if;

  return new;
end;
$$;

create trigger trg_movements_apply_stock
after insert on public.movements
for each row execute function public.apply_movement_to_stock();

-- updated_at automático en products.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_products_touch_updated_at
before update on public.products
for each row execute function public.touch_updated_at();

-- RLS abierta a cualquier usuario autenticado. Endurecer cuando se defina roles.
alter table public.products enable row level security;
alter table public.movements enable row level security;

create policy "products: read for authenticated"
  on public.products for select to authenticated using (true);

create policy "products: write for authenticated"
  on public.products for insert to authenticated with check (true);

create policy "products: update for authenticated"
  on public.products for update to authenticated using (true) with check (true);

create policy "movements: read for authenticated"
  on public.movements for select to authenticated using (true);

create policy "movements: write for authenticated"
  on public.movements for insert to authenticated
  with check (user_id is null or user_id = auth.uid());
