import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';

export interface CreateProductInput {
  code: string;
  name: string;
  variant?: string | null;
  notes?: string | null;
  initialStock?: number;
  /** Precio base (PVP de referencia) por unidad. */
  price?: number;
}

export type Product = Tables<'products'>;

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProductInput): Promise<Product> => {
      const code = input.code.trim();
      const name = input.name.trim();
      const variant = input.variant?.trim() || null;
      const notes = input.notes?.trim() || null;
      const initialStock = input.initialStock ?? 0;
      const price = input.price ?? 0;

      if (!code || !name) {
        throw new Error('El código y el nombre son obligatorios.');
      }
      if (initialStock < 0) {
        throw new Error('El stock inicial no puede ser negativo.');
      }
      if (price < 0) {
        throw new Error('El precio no puede ser negativo.');
      }

      const { data: product, error } = await supabase
        .from('products')
        .insert({ code, name, variant, notes, price })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error(`Ya existe un producto con el código "${code}".`);
        }
        throw new Error(error.message);
      }

      if (initialStock > 0) {
        const { error: movementError } = await supabase.from('movements').insert({
          product_id: product.id,
          type: 'in',
          qty: initialStock,
          note: 'Stock inicial',
        });
        if (movementError) {
          throw new Error(
            `Producto creado pero el stock inicial no se registró: ${movementError.message}`,
          );
        }
      }

      return { ...product, stock: initialStock };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['movements'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
