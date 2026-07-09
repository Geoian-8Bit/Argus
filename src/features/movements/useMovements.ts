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
  user_email: string | null;
  products: { name: string; variant: string | null; code: string } | null;
}

export interface MovementsFilter {
  /** Máximo de filas (PostgREST limita a 1000 por defecto). */
  limit?: number;
  /** Inicio del periodo (ISO), inclusive. */
  from?: string;
  /** Fin del periodo (ISO), exclusivo. */
  to?: string;
}

export function useMovements({ limit = 1000, from, to }: MovementsFilter = {}) {
  return useQuery({
    queryKey: ['movements', 'list', limit, from ?? null, to ?? null],
    queryFn: async (): Promise<MovementWithProduct[]> => {
      let query = supabase
        .from('movements')
        .select('id,type,qty,note,created_at,user_id,user_email, products(name,variant,code)')
        .order('created_at', { ascending: false });
      if (from) query = query.gte('created_at', from);
      if (to) query = query.lt('created_at', to);
      const { data, error } = await query.limit(limit);
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as MovementWithProduct[];
    },
  });
}
