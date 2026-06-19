import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';
import { productByCodeKey } from '@/features/scan/useProductByCode';

export type MovementType = Tables<'movements'>['type'];

export interface RegisterMovementInput {
  productId: string;
  productCode: string;
  type: MovementType;
  qty: number;
  note?: string | null;
  /** Precio de venta real por unidad. Solo aplica a salidas ('out'). */
  unitPrice?: number | null;
}

export function useRegisterMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterMovementInput) => {
      if (input.qty <= 0) {
        throw new Error('La cantidad debe ser mayor que 0.');
      }
      // El precio de venta solo tiene sentido en salidas; en entradas se ignora.
      const unitPrice = input.type === 'out' ? (input.unitPrice ?? null) : null;
      if (input.type === 'out' && (unitPrice === null || unitPrice < 0)) {
        throw new Error('Indica un precio de venta válido.');
      }
      // No enviamos user_id/user_email: la base de datos los rellena con
      // auth.uid() y el email del JWT (auditoría fiable, no manipulable).
      const { data, error } = await supabase
        .from('movements')
        .insert({
          product_id: input.productId,
          type: input.type,
          qty: input.qty,
          note: input.note ?? null,
          unit_price: unitPrice,
        })
        .select()
        .single();

      if (error) {
        if (/stock_check/i.test(error.message)) {
          throw new Error('No hay tanto stock disponible.');
        }
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({ queryKey: productByCodeKey(input.productCode) });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['movements'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
