-- Salvaguardas de stock al registrar movimientos.
--
-- La migración 0011 relajó el check de products.stock de (>= 0) a (>= -1) para
-- poder usar -1 como "producto desactivado". Ese check era lo único que impedía
-- que una salida dejase el stock en negativo, así que ahora una salida de más
-- unidades de las disponibles podría dejar el stock exactamente en -1 y
-- desactivar el producto sin querer (desaparece del listado y de los avisos).
--
-- Se mueven ambas validaciones al trigger, que es donde se conoce el stock
-- anterior:
--   1. No se aceptan movimientos sobre un producto desactivado (stock = -1).
--   2. Una salida no puede dejar el stock por debajo de 0.
--
-- El SELECT ... FOR UPDATE serializa además dos salidas simultáneas del mismo
-- producto, que antes podían competir por el mismo stock.

create or replace function public.apply_movement_to_stock()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  delta      integer;
  prev_stock integer;
begin
  delta := case new.type when 'in' then new.qty else -new.qty end;

  select p.stock into prev_stock
    from public.products p
   where p.id = new.product_id
     for update;

  if not found then
    raise exception 'Producto % no existe', new.product_id;
  end if;

  if prev_stock = -1 then
    raise exception 'El producto está desactivado: reactívalo antes de registrar movimientos';
  end if;

  if prev_stock + delta < 0 then
    raise exception 'Stock insuficiente: hay % unidades y se intentan sacar %', prev_stock, new.qty;
  end if;

  update public.products
     set stock = prev_stock + delta,
         updated_at = now()
   where id = new.product_id;

  return new;
end;
$$;

-- La función de 0012 se creó sin search_path fijo, al contrario que el resto
-- (ver 0002_harden_function_search_paths). Se recrea igual pero endurecida.
create or replace function public.assign_next_product_position()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.position is null then
    select coalesce(max(p.position), -1) + 1 into new.position from public.products p;
  end if;
  return new;
end;
$$;
