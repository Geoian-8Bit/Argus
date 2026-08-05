import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

/**
 * Sensores para las listas arrastrables (productos y grupos).
 *
 * MouseSensor + TouchSensor, no PointerSensor: los eventos de puntero cubren
 * también el táctil, así que registrar PointerSensor junto a TouchSensor hace
 * que en el móvil compitan dos sensores por el mismo gesto y gane uno u otro
 * según cuál cumpla antes su condición. De ahí que el arrastre funcionase unas
 * veces sí y otras no. Cada sensor escucha ahora su propia familia de eventos.
 *
 * En ratón basta con mover 6 px; en táctil se exige mantener pulsado 180 ms
 * para no robarle el gesto al scroll de la página.
 */
export function useReorderSensors() {
  return useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
  );
}

export interface PositionUpdate {
  id: string;
  position: number;
}

/**
 * Positions que ya usa el conjunto mostrado, en orden ascendente y sin
 * repetidos. Si dos elementos comparten position (o no la tienen), se separan
 * sumando 1 al anterior: de lo contrario el orden guardado sería ambiguo.
 */
export function ascendingPositions(items: { position: number | null }[]): number[] {
  const sorted = items.map((item, i) => item.position ?? i).sort((a, b) => a - b);
  return sorted.reduce<number[]>((acc, pos) => {
    const prev = acc[acc.length - 1];
    acc.push(prev === undefined || pos > prev ? pos : prev + 1);
    return acc;
  }, []);
}

/**
 * Qué filas hay que guardar tras arrastrar una: solo aquellas cuya position
 * cambia de verdad.
 *
 * Mover un elemento desplaza únicamente a los que quedan entre su hueco viejo
 * y el nuevo; el resto conserva su position. Reasignarlas todas costaba una
 * petición por producto — con 520 productos en el almacén, 520 peticiones por
 * cada arrastre, que es lo que hacía que la vista "Productos" fallase.
 */
export function changedPositions(
  oldIds: string[],
  newIds: string[],
  positions: number[],
): PositionUpdate[] {
  const updates: PositionUpdate[] = [];
  for (let i = 0; i < newIds.length; i++) {
    if (newIds[i] !== oldIds[i]) updates.push({ id: newIds[i], position: positions[i] });
  }
  return updates;
}
