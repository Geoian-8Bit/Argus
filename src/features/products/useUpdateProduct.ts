import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';
import { productKey } from './useProduct';

export interface UpdateProductInput {
  id: string;
  code: string;
  name: string;
  variant?: string | null;
  notes?: string | null;
  /** Precio base (PVP de referencia) por unidad. */
  price?: number;
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProductInput): Promise<Tables<'products'>> => {
      const code = input.code.trim();
      const name = input.name.trim();
      if (!code || !name) {
        throw new Error('El código y el nombre son obligatorios.');
      }
      const price = input.price ?? 0;
      if (price < 0) {
        throw new Error('El precio no puede ser negativo.');
      }

      const { data, error } = await supabase
        .from('products')
        .update({
          code,
          name,
          variant: input.variant?.trim() || null,
          notes: input.notes?.trim() || null,
          price,
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error(`Ya existe un producto con el código "${code}".`);
        }
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(productKey(data.id), data);
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
