import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Period } from './period';

export interface SalesSummary {
  /** Unidades vendidas (salidas con precio registrado) en el periodo. */
  unitsSold: number;
  /** Ingresos: Σ precio_venta × cantidad. */
  revenue: number;
  /** Valor a precio base de lo vendido: Σ precio_base × cantidad. */
  baseTotal: number;
  /** Diferencia sobre el precio base: ingresos − baseTotal. */
  diff: number;
}

// Ventas dentro de un periodo. Solo cuentan las salidas con precio de venta
// registrado (`unit_price`); las salidas antiguas sin precio quedan fuera.
export function useSales(period: Period) {
  const startISO = period.start.toISOString();
  const endISO = period.end.toISOString();

  return useQuery({
    queryKey: ['dashboard', 'sales', startISO, endISO],
    queryFn: async (): Promise<SalesSummary> => {
      const [sales, products] = await Promise.all([
        supabase
          .from('movements')
          .select('qty,unit_price,product_id')
          .eq('type', 'out')
          .not('unit_price', 'is', null)
          .gte('created_at', startISO)
          .lt('created_at', endISO),
        supabase.from('products').select('id,price'),
      ]);
      if (sales.error) throw new Error(sales.error.message);
      if (products.error) throw new Error(products.error.message);

      const basePriceById = new Map((products.data ?? []).map((p) => [p.id, Number(p.price) || 0]));

      let unitsSold = 0;
      let revenue = 0;
      let baseTotal = 0;
      for (const m of sales.data ?? []) {
        const qty = m.qty ?? 0;
        unitsSold += qty;
        revenue += (Number(m.unit_price) || 0) * qty;
        baseTotal += (basePriceById.get(m.product_id) ?? 0) * qty;
      }

      return { unitsSold, revenue, baseTotal, diff: revenue - baseTotal };
    },
  });
}
