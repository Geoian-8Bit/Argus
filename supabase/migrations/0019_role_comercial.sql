-- Rol "comercial".
--
-- profiles.role estaba limitado a admin|staff por un check. El comercial es un
-- tercer rol: trabaja contra su propio almacén, registra movimientos a mano (sin
-- escanear) y no administra nada.
--
-- Qué ve cada rol NO lo decide este check, sino warehouse_members (ver 0016):
-- el rol solo decide qué puede hacer dentro de lo que ve.

alter table public.profiles drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role = any (array['admin'::text, 'staff'::text, 'comercial'::text]));
