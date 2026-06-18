import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { LOW_STOCK_THRESHOLD } from '@/features/products/constants';

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
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .gt('stock', 0)
          .lte('stock', LOW_STOCK_THRESHOLD),
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
