import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface MonthlySales {
  /** Unidades vendidas (salidas con precio registrado) en el mes en curso. */
  unitsSold: number;
  /** Ingresos: Σ precio_venta × cantidad. */
  revenue: number;
  /** Valor a precio base de lo vendido: Σ precio_base × cantidad. */
  baseTotal: number;
  /** Diferencia sobre el precio base: ingresos − baseTotal. */
  diff: number;
  /** Mes en curso, legible (p. ej. "junio"). */
  monthLabel: string;
}

const monthFmt = new Intl.DateTimeFormat('es', { month: 'long' });

// Ventas del mes en curso. Solo cuentan las salidas con precio de venta
// registrado (`unit_price`); las salidas antiguas sin precio quedan fuera.
export function useMonthlySales() {
  return useQuery({
    queryKey: ['dashboard', 'monthly-sales'],
    queryFn: async (): Promise<MonthlySales> => {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      const [sales, products] = await Promise.all([
        supabase
          .from('movements')
          .select('qty,unit_price,product_id')
          .eq('type', 'out')
          .not('unit_price', 'is', null)
          .gte('created_at', start.toISOString()),
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

      return {
        unitsSold,
        revenue,
        baseTotal,
        diff: revenue - baseTotal,
        monthLabel: monthFmt.format(start),
      };
    },
  });
}
