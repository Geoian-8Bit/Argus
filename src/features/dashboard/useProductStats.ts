import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ProductStat {
  id: string;
  code: string;
  name: string;
  variant: string | null;
  stock: number;
  /** Precio base (PVP de referencia) por unidad. */
  price: number;
  total_in: number;
  total_out: number;
  /** Ingresos acumulados por ventas (Σ precio_venta × cantidad). */
  total_revenue: number;
  movements_count: number;
  last_movement_at: string | null;
}

export function useProductStats() {
  return useQuery({
    queryKey: ['dashboard', 'product-stats'],
    queryFn: async (): Promise<ProductStat[]> => {
      const { data, error } = await supabase
        .from('product_stats')
        .select(
          'id,code,name,variant,stock,price,total_in,total_out,total_revenue,movements_count,last_movement_at',
        )
        .is('archived_at', null);
      if (error) throw new Error(error.message);
      return (data ?? []).map((r) => ({
        id: r.id ?? '',
        code: r.code ?? '',
        name: r.name ?? '',
        variant: r.variant,
        stock: r.stock ?? 0,
        price: r.price ?? 0,
        total_in: r.total_in ?? 0,
        total_out: r.total_out ?? 0,
        total_revenue: r.total_revenue ?? 0,
        movements_count: r.movements_count ?? 0,
        last_movement_at: r.last_movement_at,
      }));
    },
  });
}
