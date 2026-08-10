# Almacenes por comercial

**Estado:** implementado en parte (2026-08-10). Quedan fuera los artículos
especiales y el informe diario; ver "Pendiente" al final.

La idea se describió como "subalmacenes", pero al concretarla quedó claro que no
hay jerarquía: son **almacenes independientes**, cada uno con sus productos y sus
movimientos. Lo que cambia entre unos y otros es quién accede.

## Lo que ya funciona

### Almacenes independientes

- Tabla `warehouses` y tabla de acceso `warehouse_members` (migración 0016).
- Productos, grupos y movimientos cuelgan de un almacén (`warehouse_id`).
- Lo que había antes se migró a un almacén llamado "Almacén principal", y todos
  los usuarios existentes son miembros suyo: nadie pierde acceso.
- El código de producto es único **dentro de cada almacén**, no global: dos
  almacenes independientes pueden repetir código sin enterarse el uno del otro.
  La búsqueda por código (escaneo) va siempre acotada al almacén activo.

### Permisos

- RLS por almacén: solo se ven productos, grupos y movimientos de los almacenes
  a los que se accede. Un admin accede a todos sin estar en `warehouse_members`.
- Rol nuevo `comercial` (migración 0019): registra movimientos a mano sobre su
  almacén y ve sus ventas. No administra nada.
- Selector de almacén en la cabecera. Solo aparece si hay más de uno al que
  elegir, así que un comercial con un único almacén no lo ve.
- Página **Almacenes** (solo admin, se entra desde Usuarios): crear, renombrar,
  archivar y decidir quién accede a cada uno.

### Movimientos sin QR

- Página **Registrar** (`/movement`): se elige el producto de una lista en vez de
  escanear. Campos: cantidad, cliente, comentario opcional y precio de venta.
- El cliente se guarda como texto libre en `movements.customer`. No hay maestro
  de clientes: normalizarlo obligaría a darlos de alta antes de poder registrar
  nada. Si más adelante hace falta agrupar por cliente, se migra ese texto a una
  tabla.
- El precio de venta se precarga con el precio base del producto y se puede
  cambiar antes de confirmar (cada comercial vende a su precio).

### Venta contratos / venta piezas / venta total

- Cada artículo se marca como **contrato** o **pieza** (`products.sale_kind`,
  migración 0018). Por defecto, pieza.
- El panel reparte los ingresos del periodo según ese tipo: venta contratos +
  venta piezas = venta total. Nadie teclea importes; todo sale de los
  movimientos de salida, como el resto de métricas.
- El comercial ve su propio panel de ventas (pestaña "Ventas"), limitado a su
  almacén.

## Pendiente

### Artículos especiales (margen del comercial)

Sin empezar. Son artículos que el comercial compra "de salida" a un precio
(p. ej. 7 €) y vende a otro (10 €, 15 €…), quedándose la diferencia.

- **Falta preguntar a Nerea** cómo tratarlos exactamente antes de tocar nada.
- Del texto original se deduce que no deberían contar como el resto de ventas,
  pero no está claro si se excluyen de los totales, si se registra el margen, o
  ambas cosas.

### Informe diario

Sin empezar. Hoy es un formulario en papel.

- Se quiere pasar a un formulario dentro de la app, que se rellene ahí.
- Tiene que poderse exportar e imprimir **con el mismo formato que el papel**.
- **Falta conseguir el papel** (foto, PDF o plantilla) para poder replicarlo.

---

## Texto original (tal cual se pidió guardar)

> para los comerciales, se quiere hacer subalamcenes para que cada uno tenga
> sus productos y sus movimientos que después Nerea pued verlo para cada
> comercial. Cada comercial contara con su subalmacen al cual solo ellos
> podrán acceder. Después que los comerciales hagan movimientos sin qr solo
> directamente, en los movimientos tendrán la cantidad del
> producto/artículo, el cliente y un comentario opcional. Después que
> administración, puedan ver todos seleccionando que comercial. Hay
> artículos especiales, que no lo tendrán en cuenta porque ellos ya lo
> compran de salida por ejemplo 7 euros y después ellos lo venden a 10, 15,
> etc. esa diferencia se la llevan (preguntar a Nerea). Que puedan ver el
> campo de venta contratos, venta piezas y venta total. Hacer que el papel
> del informe diario, sea un formulario todo en la app y que se rellene de
> esa forma y que se pueda exportar e imprimir con el formato correcto.
