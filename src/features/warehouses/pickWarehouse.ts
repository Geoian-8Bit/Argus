import type { Warehouse } from './useWarehouses';

/**
 * Elige el almacén activo. El guardado puede haber desaparecido (se borró, se
 * archivó o le quitaron el acceso al usuario): en ese caso se cae al primero
 * disponible en vez de dejar la app sin almacén.
 */
export function pickWarehouse(
  warehouses: Warehouse[],
  selectedId: string | null,
): Warehouse | null {
  if (warehouses.length === 0) return null;
  return warehouses.find((w) => w.id === selectedId) ?? warehouses[0];
}
