-- can_access_warehouse() es un ayudante de las políticas RLS, no un endpoint.
-- Al ser SECURITY DEFINER y quedar expuesta en /rest/v1/rpc, se le quita el
-- EXECUTE por defecto de PUBLIC (que incluye a anon) y se deja solo para
-- usuarios autenticados.

revoke execute on function public.can_access_warehouse(uuid) from public;
revoke execute on function public.can_access_warehouse(uuid) from anon;
grant execute on function public.can_access_warehouse(uuid) to authenticated;
