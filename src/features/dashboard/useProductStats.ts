import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Enums } from '@/lib/database.types';
import { useWarehouse } from '@/features/warehouses/useWarehouse';

export interface ProductStat {
  id: string;
  code: string;
  name: string;
  variant: string | null;
  stock: number;
  /** Umbral de stock bajo del producto. */
  min_stock: number;
  /** Precio base (PVP de referencia) por unidad. */
  price: number;
  /** Contrato o pieza. */
  sale_kind: Enums<'sale_kind'>;
  total_in: number;
  total_out: number;
  /** Ingresos acumulados por ventas (Σ precio_venta × cantidad). */
  total_revenue: number;
  movements_count: number;
  last_movement_at: string | null;
}

export function useProductStats() {
  const { currentId } = useWarehouse();
  return useQuery({
    queryKey: ['dashboard', 'product-stats', currentId],
    enabled: !!currentId,
    queryFn: async (): Promise<ProductStat[]> => {
      const { data, error } = await supabase
        .from('product_stats')
        .select(
          'id,code,name,variant,stock,min_stock,price,sale_kind,total_in,total_out,total_revenue,movements_count,last_movement_at',
        )
        .eq('warehouse_id', currentId!)
        .is('archived_at', null);
      if (error) throw new Error(error.message);
      return (data ?? []).map((r) => ({
        id: r.id ?? '',
        code: r.code ?? '',
        name: r.name ?? '',
        variant: r.variant,
        stock: r.stock ?? 0,
        min_stock: r.min_stock ?? 0,
        price: r.price ?? 0,
        sale_kind: r.sale_kind ?? 'pieza',
        total_in: r.total_in ?? 0,
        total_out: r.total_out ?? 0,
        total_revenue: r.total_revenue ?? 0,
        movements_count: r.movements_count ?? 0,
        last_movement_at: r.last_movement_at,
      }));
    },
  });
}
