import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useWarehouse } from '@/features/warehouses/useWarehouse';
import type { Period } from './period';

export interface SalesSummary {
  /** Unidades vendidas (salidas con precio registrado) en el periodo. */
  unitsSold: number;
  /** Ingresos: Σ precio_venta × cantidad. Es la "venta total". */
  revenue: number;
  /** Parte de los ingresos que viene de artículos de tipo contrato. */
  contractsRevenue: number;
  /** Parte de los ingresos que viene de artículos de tipo pieza. */
  piecesRevenue: number;
  /** Valor a precio base de lo vendido: Σ precio_base × cantidad. */
  baseTotal: number;
  /** Diferencia sobre el precio base: ingresos − baseTotal. */
  diff: number;
}

export interface SaleRow {
  qty: number | null;
  unit_price: number | string | null;
  product_id: string;
}

export interface SaleProduct {
  id: string;
  price: number | string | null;
  sale_kind: 'contrato' | 'pieza';
}

/**
 * Agrega las salidas de un periodo. El reparto contratos/piezas sale del tipo
 * del artículo, así que los dos siempre suman la venta total.
 */
export function summarizeSales(sales: SaleRow[], products: SaleProduct[]): SalesSummary {
  const byId = new Map(
    products.map((p) => [p.id, { price: Number(p.price) || 0, kind: p.sale_kind }]),
  );

  let unitsSold = 0;
  let revenue = 0;
  let contractsRevenue = 0;
  let piecesRevenue = 0;
  let baseTotal = 0;
  for (const m of sales) {
    const qty = m.qty ?? 0;
    const amount = (Number(m.unit_price) || 0) * qty;
    const product = byId.get(m.product_id);
    unitsSold += qty;
    revenue += amount;
    baseTotal += (product?.price ?? 0) * qty;
    if (product?.kind === 'contrato') contractsRevenue += amount;
    else piecesRevenue += amount;
  }

  return {
    unitsSold,
    revenue,
    contractsRevenue,
    piecesRevenue,
    baseTotal,
    diff: revenue - baseTotal,
  };
}

// Ventas dentro de un periodo. Solo cuentan las salidas con precio de venta
// registrado (`unit_price`); las salidas antiguas sin precio quedan fuera.
export function useSales(period: Period) {
  const startISO = period.start.toISOString();
  const endISO = period.end.toISOString();
  const { currentId } = useWarehouse();

  return useQuery({
    queryKey: ['dashboard', 'sales', currentId, startISO, endISO],
    enabled: !!currentId,
    queryFn: async (): Promise<SalesSummary> => {
      const [sales, products] = await Promise.all([
        supabase
          .from('movements')
          .select('qty,unit_price,product_id')
          .eq('warehouse_id', currentId!)
          .eq('type', 'out')
          .not('unit_price', 'is', null)
          .gte('created_at', startISO)
          .lt('created_at', endISO),
        supabase.from('products').select('id,price,sale_kind').eq('warehouse_id', currentId!),
      ]);
      if (sales.error) throw new Error(sales.error.message);
      if (products.error) throw new Error(products.error.message);

      return summarizeSales(sales.data ?? [], products.data ?? []);
    },
  });
}
