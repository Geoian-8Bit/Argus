import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { PositionUpdate } from './reorder';

/** Reordena manualmente (arrastrar y soltar) los grupos de productos. */
export function useReorderGroups() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: PositionUpdate[]) => {
      if (updates.length === 0) return;
      const results = await Promise.all(
        updates.map(({ id, position }) =>
          supabase.from('product_groups').update({ position }).eq('id', id),
        ),
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw new Error(failed.error.message);
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ['product-groups'] });
      const previous = queryClient.getQueriesData({ queryKey: ['product-groups'] });
      const positionById = new Map(updates.map((u) => [u.id, u.position]));
      queryClient.setQueriesData({ queryKey: ['product-groups'] }, (old: unknown) => {
        if (!Array.isArray(old)) return old;
        return old
          .map((g) => {
            const pos = positionById.get(g.id);
            return pos === undefined ? g : { ...g, position: pos };
          })
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.name.localeCompare(b.name));
      });
      return { previous };
    },
    onError: (_err, _input, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['product-groups'] });
    },
  });
}
