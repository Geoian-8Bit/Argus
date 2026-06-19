-- Revisiones de "Material en furgoneta": checklist que rellenan los repartidores.
-- Cada fila es una revisión con sus ítems (mapa id -> presente true/false),
-- la fecha y el autor, atribuidos automáticamente en el servidor.

create table public.van_checklists (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_id     uuid default auth.uid() references auth.users(id) on delete set null,
  user_email  text default (auth.jwt() ->> 'email'),
  items       jsonb not null,
  note        text
);

create index van_checklists_created_at_idx on public.van_checklists (created_at desc);
create index van_checklists_user_idx on public.van_checklists (user_id, created_at desc);

alter table public.van_checklists enable row level security;

-- Solo puedes crear revisiones a tu nombre (el user_id lo pone el servidor).
create policy "van_checklists: insert as self"
  on public.van_checklists for insert to authenticated
  with check (user_id = auth.uid());

-- Cada uno ve las suyas; los administradores ven todas (control).
create policy "van_checklists: read own or admin"
  on public.van_checklists for select to authenticated
  using (public.is_admin() or user_id = auth.uid());
