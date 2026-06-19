-- Gestión de usuarios desde la app (página solo-admin).
-- Hasta ahora "profiles" solo tenía SELECT del propio perfil. Para que un admin
-- pueda listar usuarios y cambiarles el rol añadimos políticas RLS sobre is_admin().
-- La creación de usuarios se hace en la Edge Function "admin-create-user"
-- (necesita la service_role, que no puede vivir en el navegador).

-- Un admin puede leer todos los perfiles.
create policy "profiles: admin read all"
  on public.profiles for select
  using (public.is_admin());

-- Un admin puede actualizar perfiles (en la práctica, el rol).
create policy "profiles: admin update"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());
