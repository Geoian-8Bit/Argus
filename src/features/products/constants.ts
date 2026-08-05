// Umbral de stock bajo por defecto al crear un producto. Cada producto puede
// tener el suyo propio (products.min_stock).
export const DEFAULT_MIN_STOCK = 5;

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
