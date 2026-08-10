import type { Enums } from '@/lib/database.types';
import type { SegmentedOption } from '@/components/ui';

// Umbral de stock bajo por defecto al crear un producto. Cada producto puede
// tener el suyo propio (products.min_stock).
export const DEFAULT_MIN_STOCK = 5;

// Tipo de artículo. Parte las ventas del panel en "venta contratos" y "venta
// piezas": la mayoría del material es pieza, así que ese es el valor por defecto.
export const DEFAULT_SALE_KIND: Enums<'sale_kind'> = 'pieza';

export const SALE_KIND_OPTIONS: SegmentedOption<Enums<'sale_kind'>>[] = [
  { value: 'pieza', label: 'Pieza' },
  { value: 'contrato', label: 'Contrato' },
];

// Sentinela de stock: -1 marca el producto como "no se utiliza" (desactivado)
// sin archivarlo. No cuenta como agotado ni como stock bajo.
export const INACTIVE_STOCK = -1;

export type StockStatus = 'ok' | 'low' | 'out' | 'inactive';

// Verde por encima del umbral; rojo (bajo o agotado) en el umbral o por debajo.
export function stockStatus(stock: number, minStock: number = DEFAULT_MIN_STOCK): StockStatus {
  if (stock === INACTIVE_STOCK) return 'inactive';
  if (stock <= 0) return 'out';
  if (stock <= minStock) return 'low';
  return 'ok';
}
