import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { INACTIVE_STOCK } from '@/features/products/constants';

export interface DashboardStats {
  totalProducts: number;
  lowStock: number;
  movementsToday: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const iso = startOfToday.toISOString();

      const [total, low, today] = await Promise.all([
        // Mismo criterio que el listado: ni archivados ni desactivados, para
        // que el total de la tarjeta cuadre con los productos que se ven.
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .is('archived_at', null)
          .neq('stock', INACTIVE_STOCK),
        // Sin stock o bajo umbral (flags is_out / is_low de la vista). Los
        // desactivados (stock = -1) nunca cumplen ninguno de los dos.
        supabase
          .from('product_stats')
          .select('*', { count: 'exact', head: true })
          .is('archived_at', null)
          .or('is_low.eq.true,is_out.eq.true'),
        supabase
          .from('movements')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', iso),
      ]);

      if (total.error) throw new Error(total.error.message);
      if (low.error) throw new Error(low.error.message);
      if (today.error) throw new Error(today.error.message);

      return {
        totalProducts: total.count ?? 0,
        lowStock: low.count ?? 0,
        movementsToday: today.count ?? 0,
      };
    },
  });
}
