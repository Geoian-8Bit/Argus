-- Endurecer las funciones SECURITY: fijar search_path = '' para evitar
-- que un usuario con CREATE en cualquier schema pueda interferir con
-- objetos no calificados (`public.products`, `now()`...). Ver:
-- https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

create or replace function public.apply_movement_to_stock()
returns trigger
language plpgsql
set search_path = ''
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

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
