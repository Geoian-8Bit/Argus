export const LOW_STOCK_THRESHOLD = 5;

export type StockStatus = 'ok' | 'low' | 'out';

export function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'out';
  if (stock <= LOW_STOCK_THRESHOLD) return 'low';
  return 'ok';
}
