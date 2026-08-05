-- Alias de usuario: nombre visible en vez del email en listados y menús.
-- Opcional; si no se define se sigue mostrando el email como hasta ahora.
alter table public.profiles
  add column if not exists display_name text;
