import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ReorderProductsInput {
  /** Ids en el nuevo orden deseado. */
  ids: string[];
  /**
   * Positions ya usadas por ese mismo subconjunto (en su orden anterior),
   * ordenadas ascendente. Se reasignan 1:1 a `ids`, así que nunca colisionan
   * con las positions de productos fuera del subconjunto reordenado.
   */
  positions: number[];
}

/** Reordena manualmente (arrastrar y soltar) un grupo de productos. */
export function useReorderProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, positions }: ReorderProductsInput) => {
      if (ids.length !== positions.length) {
        throw new Error('Orden inconsistente al reordenar productos.');
      }
      const updates = ids.map((id, i) =>
        supabase.from('products').update({ position: positions[i] }).eq('id', id),
      );
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw new Error(failed.error.message);
    },
    // Optimista: sin esto el listado "salta" al orden viejo mientras llega la
    // respuesta y luego vuelve a moverse al orden nuevo.
    onMutate: async ({ ids, positions }) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previous = queryClient.getQueriesData({ queryKey: ['products'] });
      const positionById = new Map(ids.map((id, i) => [id, positions[i]]));
      queryClient.setQueriesData({ queryKey: ['products'] }, (old: unknown) => {
        if (!Array.isArray(old)) return old;
        return old
          .map((p) => {
            const pos = positionById.get(p.id);
            return pos === undefined ? p : { ...p, position: pos };
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
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
