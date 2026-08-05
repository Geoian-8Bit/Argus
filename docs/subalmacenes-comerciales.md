# Subalmacenes para comerciales — idea futura (sin implementar)

**Estado:** pendiente, no implementado. Guardado el 2026-08-05 tal como se
describió en conversación, para retomarlo más adelante. No se ha diseñado ni
empezado nada de esto todavía.

## Resumen

- Subalmacenes por comercial: cada comercial tendría su propio subalmacén,
  con sus propios productos y sus propios movimientos.
- Solo el comercial dueño podría acceder a su subalmacén.
- Administración (Nerea) podría ver todos los subalmacenes, seleccionando de
  qué comercial quiere ver los datos.

## Movimientos de los comerciales

- Sin QR: los comerciales registrarían movimientos directamente, sin
  escanear.
- Cada movimiento incluiría: cantidad del producto/artículo, cliente, y un
  comentario opcional.

## Artículos especiales (margen)

- Hay artículos especiales que no se contabilizarían como el resto: el
  comercial los compra "de salida" a un precio (p. ej. 7 €) y luego los
  vende a otro precio (10 €, 15 €, etc.), quedándose él la diferencia.
- **Pendiente de preguntar a Nerea** cómo tratar esto exactamente.

## Informes / campos a mostrar

- Ver los campos "venta contratos", "venta piezas" y "venta total".

## Informe diario

- Actualmente es un papel/formulario en papel.
- Se quiere pasar a un formulario dentro de la app, que se rellene ahí
  directamente.
- Tendría que poderse exportar e imprimir manteniendo el formato correcto
  (el mismo que usan ahora en papel).

## Preguntas abiertas (antes de diseñar/implementar nada de esto)

- Confirmar con Nerea el tratamiento exacto de los artículos especiales y su
  margen.
- Conseguir/definir el formato exacto del informe diario en papel, para
  poder replicarlo en digital.
- Definir los permisos exactos: ¿el comercial ve solo su subalmacén, o
  también puede ver productos del almacén general? ¿Y al revés, un producto
  del almacén general puede pasar a un subalmacén?
- Definir la relación entre el subalmacén de cada comercial y el inventario
  central (¿resta stock del central al asignarlo al subalmacén, o es
  independiente?).

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
