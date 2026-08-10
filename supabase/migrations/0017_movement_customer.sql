-- Cliente en el movimiento.
--
-- Los comerciales registran los movimientos a mano (sin escanear) y anotan a qué
-- cliente va cada salida. El comentario ya existía como movements.note.
--
-- Se guarda como texto libre, no como tabla de clientes: hoy no hay maestro de
-- clientes en la app y normalizarlo obligaría a darlos de alta antes de poder
-- registrar nada. Si más adelante hace falta agrupar ventas por cliente, se
-- migra este texto a una tabla.

alter table public.movements
  add column if not exists customer text;

create index if not exists movements_customer_idx
  on public.movements (warehouse_id, customer)
  where customer is not null;
