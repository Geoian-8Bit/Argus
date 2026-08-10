import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';
import { useAuth } from '@/features/auth/useAuth';

export type Warehouse = Tables<'warehouses'>;

/**
 * Almacenes a los que accede quien ha iniciado sesión. No hace falta filtrar
 * aquí: la RLS ya devuelve solo los suyos (y todos, si es admin).
 */
export function useWarehouses() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['warehouses', 'list', user?.id],
    enabled: !!user,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Warehouse[]> => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .is('archived_at', null)
        .order('position', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}
