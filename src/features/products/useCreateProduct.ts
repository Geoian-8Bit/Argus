import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Enums, Tables } from '@/lib/database.types';
import { useWarehouse } from '@/features/warehouses/useWarehouse';

export interface CreateProductInput {
  code: string;
  name: string;
  variant?: string | null;
  notes?: string | null;
  initialStock?: number;
  /** Precio base (PVP de referencia) por unidad. */
  price?: number;
  /** Umbral de stock bajo. */
  minStock?: number;
  /** Grupo al que pertenece el producto. */
  groupId?: string | null;
  /** Contrato o pieza: parte las ventas en el panel. */
  saleKind?: Enums<'sale_kind'>;
}

export type Product = Tables<'products'>;

/**
 * El código choca con un producto ya existente. Si ese producto está archivado
 * no aparece en el listado, así que el error lo señala para poder restaurarlo.
 */
export class ProductCodeConflictError extends Error {
  readonly code: string;
  readonly productId: string | null;
  readonly productName: string | null;
  readonly archived: boolean;

  constructor(
    code: string,
    existing: { id: string; name: string; archived_at: string | null } | null,
  ) {
    const archived = Boolean(existing?.archived_at);
    super(
      archived
        ? `Ya existe un producto archivado con el código "${code}"${
            existing?.name ? ` (${existing.name})` : ''
          }. Puedes restaurarlo.`
        : `Ya existe un producto con el código "${code}".`,
    );
    this.name = 'ProductCodeConflictError';
    this.code = code;
    this.productId = existing?.id ?? null;
    this.productName = existing?.name ?? null;
    this.archived = archived;
  }
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { currentId } = useWarehouse();

  return useMutation({
    mutationFn: async (input: CreateProductInput): Promise<Product> => {
      const code = input.code.trim();
      const name = input.name.trim();
      const variant = input.variant?.trim() || null;
      const notes = input.notes?.trim() || null;
      const initialStock = input.initialStock ?? 0;
      const price = input.price ?? 0;
      const minStock = input.minStock ?? 0;

      if (!code || !name) {
        throw new Error('El código y el nombre son obligatorios.');
      }
      if (initialStock < 0) {
        throw new Error('El stock inicial no puede ser negativo.');
      }
      if (price < 0) {
        throw new Error('El precio no puede ser negativo.');
      }
      if (minStock < 0) {
        throw new Error('El umbral de stock no puede ser negativo.');
      }
      if (!currentId) {
        throw new Error('No hay un almacén seleccionado.');
      }

      const { data: product, error } = await supabase
        .from('products')
        .insert({
          code,
          name,
          variant,
          notes,
          price,
          min_stock: minStock,
          group_id: input.groupId ?? null,
          sale_kind: input.saleKind ?? 'pieza',
          warehouse_id: currentId,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // El código ya existe en este almacén. Buscamos el producto (puede
          // estar archivado y por eso no salir en el listado) para ofrecer
          // restaurarlo.
          const { data: existing } = await supabase
            .from('products')
            .select('id, name, archived_at')
            .eq('warehouse_id', currentId)
            .eq('code', code)
            .maybeSingle();
          throw new ProductCodeConflictError(code, existing ?? null);
        }
        throw new Error(error.message);
      }

      if (initialStock > 0) {
        const { error: movementError } = await supabase.from('movements').insert({
          product_id: product.id,
          type: 'in',
          qty: initialStock,
          note: 'Stock inicial',
          warehouse_id: currentId,
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
