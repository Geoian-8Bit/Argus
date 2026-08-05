import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';

export type AlertProduct = Tables<'product_stats'>;

/**
 * Productos activos sin stock o por debajo de su umbral (min_stock).
 * Excluye archivados y desactivados (stock = -1): is_low / is_out ya los
 * excluyen a nivel de vista, pero se filtra también aquí por claridad.
 */
export function useAlertProducts(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'alert-products'],
    enabled,
    queryFn: async (): Promise<AlertProduct[]> => {
      const { data, error } = await supabase
        .from('product_stats')
        .select('*')
        .is('archived_at', null)
        .or('is_low.eq.true,is_out.eq.true')
        .order('stock', { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}
