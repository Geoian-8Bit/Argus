-- Auditoría fiable de movimientos: atribución automática y a prueba de manipulación.

-- 1) Atribución automática en el servidor (no depende del cliente).
alter table public.movements
  alter column user_id set default auth.uid();

-- 2) Email del autor denormalizado (registro inmutable para auditoría;
--    sobrevive aunque el usuario cambie de email o se elimine).
alter table public.movements
  add column if not exists user_email text default (auth.jwt() ->> 'email');

-- 3) RLS de inserción endurecida: solo puedes crear movimientos a tu nombre.
drop policy if exists "movements: write for authenticated" on public.movements;
create policy "movements: insert as self"
  on public.movements for insert to authenticated
  with check (user_id = auth.uid());
