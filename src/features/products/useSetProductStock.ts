import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { INACTIVE_STOCK } from './constants';
import { productKey } from './useProduct';

export interface SetProductStockInput {
  id: string;
  /** Stock a fijar directamente (sin pasar por movimientos). -1 = desactivar. */
  stock: number;
}

/**
 * Fija el stock de un producto directamente, sin registrar un movimiento.
 * Se usa para desactivar un producto (stock = -1, "no se utiliza") y para
 * reactivarlo con un stock inicial nuevo. No genera histórico de movimientos:
 * es un ajuste administrativo, no una entrada/salida real.
 */
export function useSetProductStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stock }: SetProductStockInput) => {
      if (!Number.isInteger(stock) || stock < INACTIVE_STOCK) {
        throw new Error('Cantidad de stock no válida.');
      }
      const { data, error } = await supabase
        .from('products')
        .update({ stock })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(productKey(data.id), data);
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
