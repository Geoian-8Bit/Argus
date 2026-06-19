import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ChecklistState } from './items';

export interface ChecklistRecord {
  id: string;
  created_at: string;
  user_email: string | null;
  items: ChecklistState;
  note: string | null;
}

// Revisiones de furgoneta. La RLS decide el alcance: el staff recibe solo las
// suyas; un administrador, las de todos.
export function useChecklists(limit = 100) {
  return useQuery({
    queryKey: ['checklists', limit],
    queryFn: async (): Promise<ChecklistRecord[]> => {
      const { data, error } = await supabase
        .from('van_checklists')
        .select('id,created_at,user_email,items,note')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      return (data ?? []).map((r) => ({
        id: r.id,
        created_at: r.created_at,
        user_email: r.user_email,
        items: (r.items ?? {}) as unknown as ChecklistState,
        note: r.note,
      }));
    },
  });
}
