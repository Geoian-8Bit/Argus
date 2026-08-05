import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';
import { INACTIVE_STOCK } from './constants';

export type Product = Tables<'products'>;

export function useProducts(search = '') {
  const term = search.trim();
  return useQuery({
    queryKey: ['products', 'list', term],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase
        .from('products')
        .select('*')
        .order('position', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true });
      if (term) {
        // Buscando: incluye también los archivados y desactivados (se marcan
        // aparte) para poder encontrarlos y reactivarlos.
        const like = `%${term}%`;
        query = query.or(`code.ilike.${like},name.ilike.${like}`);
      } else {
        // Navegando: solo productos activos y en uso (stock -1 = desactivado).
        query = query.is('archived_at', null).neq('stock', INACTIVE_STOCK);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      // price es numeric en Postgres y viaja como string; lo normalizamos a number.
      return (data ?? []).map((p) => ({ ...p, price: Number(p.price) || 0 }));
    },
  });
}
