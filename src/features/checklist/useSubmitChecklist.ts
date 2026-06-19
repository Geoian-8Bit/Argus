import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ChecklistState } from './items';

// Guarda una revisión de furgoneta. El user_id, el email y la fecha los pone el
// servidor automáticamente (defaults de columna), no el cliente.
export function useSubmitChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { items: ChecklistState; note?: string | null }) => {
      const { data, error } = await supabase
        .from('van_checklists')
        .insert({ items: input.items, note: input.note?.trim() || null })
        .select('id,created_at')
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
  });
}
