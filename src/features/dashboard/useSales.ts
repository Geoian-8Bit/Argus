import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useWarehouse } from '@/features/warehouses/useWarehouse';
import { summarizeSales, type SalesSummary } from './sales';
import type { Period } from './period';

export type { SalesSummary } from './sales';

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
