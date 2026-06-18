import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';

export type MovementType = Tables<'movements'>['type'];

export interface MovementWithProduct {
  id: string;
  type: MovementType;
  qty: number;
  note: string | null;
  created_at: string;
  user_id: string | null;
  products: { name: string; variant: string | null; code: string } | null;
}

export function useMovements(limit = 100) {
  return useQuery({
    queryKey: ['movements', 'list', limit],
    queryFn: async (): Promise<MovementWithProduct[]> => {
      const { data, error } = await supabase
        .from('movements')
        .select('id,type,qty,note,created_at,user_id, products(name,variant,code)')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as MovementWithProduct[];
    },
  });
}
