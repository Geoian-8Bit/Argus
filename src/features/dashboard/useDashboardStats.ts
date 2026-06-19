import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

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
        supabase.from('products').select('*', { count: 'exact', head: true }),
        // Bajo umbral según el min_stock de cada producto (flag is_low de la vista).
        supabase
          .from('product_stats')
          .select('*', { count: 'exact', head: true })
          .is('archived_at', null)
          .eq('is_low', true),
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
