import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';
import { useWarehouse } from '@/features/warehouses/useWarehouse';

export type Product = Tables<'products'>;

export function productByCodeKey(code: string, warehouseId?: string | null) {
  return ['product', 'by-code', warehouseId ?? null, code] as const;
}

export function useProductByCode(code: string | null) {
  const { currentId } = useWarehouse();
  return useQuery({
    queryKey: productByCodeKey(code ?? '', currentId),
    enabled: !!code && !!currentId,
    queryFn: async (): Promise<Product | null> => {
      if (!code) return null;
      // El código solo es único dentro de un almacén, así que la búsqueda va
      // siempre acotada al activo: si no, un admin con acceso a varios podría
      // recibir dos filas para el mismo código.
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('warehouse_id', currentId!)
        .eq('code', code)
        .is('archived_at', null)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });
}
