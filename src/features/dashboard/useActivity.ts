import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useWarehouse } from '@/features/warehouses/useWarehouse';

export interface ActivityDay {
  key: string;
  label: string;
  /** Día del mes (1-31), para desambiguar días con la misma inicial. */
  dayOfMonth: number;
  inQty: number;
  outQty: number;
}

const WEEKDAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

// Movimientos agregados por día de los últimos `days` días (para el gráfico).
export function useActivity(days = 7) {
  const { currentId } = useWarehouse();
  return useQuery({
    queryKey: ['dashboard', 'activity', currentId, days],
    enabled: !!currentId,
    queryFn: async (): Promise<ActivityDay[]> => {
      const since = new Date();
      since.setHours(0, 0, 0, 0);
      since.setDate(since.getDate() - (days - 1));

      const { data, error } = await supabase
        .from('movements')
        .select('type,qty,created_at')
        .eq('warehouse_id', currentId!)
        .gte('created_at', since.toISOString());
      if (error) throw new Error(error.message);

      // Inicializa los `days` cubos (hoy hacia atrás).
      const buckets: ActivityDay[] = [];
      const index = new Map<string, ActivityDay>();
      for (let i = 0; i < days; i++) {
        const d = new Date(since);
        d.setDate(since.getDate() + i);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const day: ActivityDay = {
          key,
          label: WEEKDAYS[d.getDay()],
          dayOfMonth: d.getDate(),
          inQty: 0,
          outQty: 0,
        };
        buckets.push(day);
        index.set(key, day);
      }

      for (const m of data ?? []) {
        const d = new Date(m.created_at);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const day = index.get(key);
        if (!day) continue;
        if (m.type === 'in') day.inQty += m.qty;
        else day.outQty += m.qty;
      }

      return buckets;
    },
  });
}
