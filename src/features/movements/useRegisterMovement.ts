import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';
import { productByCodeKey } from '@/features/scan/useProductByCode';
import { useWarehouse } from '@/features/warehouses/useWarehouse';

export type MovementType = Tables<'movements'>['type'];

export interface RegisterMovementInput {
  productId: string;
  productCode: string;
  type: MovementType;
  qty: number;
  note?: string | null;
  /** Cliente al que va la salida. Lo anotan los comerciales. */
  customer?: string | null;
  /** Precio de venta real por unidad. Solo aplica a salidas ('out'). */
  unitPrice?: number | null;
}

export function useRegisterMovement() {
  const queryClient = useQueryClient();
  const { currentId } = useWarehouse();

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
      // El cliente solo se anota en salidas: una entrada no se le vende a nadie.
      const customer = input.type === 'out' ? input.customer?.trim() || null : null;
      if (!currentId) {
        throw new Error('No hay un almacén seleccionado.');
      }
      // No enviamos user_id/user_email: la base de datos los rellena con
      // auth.uid() y el email del JWT (auditoría fiable, no manipulable).
      // warehouse_id se manda por exigencia del tipo, pero manda el trigger:
      // lo sobrescribe con el almacén del producto.
      const { data, error } = await supabase
        .from('movements')
        .insert({
          product_id: input.productId,
          type: input.type,
          qty: input.qty,
          note: input.note ?? null,
          customer,
          unit_price: unitPrice,
          warehouse_id: currentId,
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
      void queryClient.invalidateQueries({
        queryKey: productByCodeKey(input.productCode, currentId),
      });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['movements'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
