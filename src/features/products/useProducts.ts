import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';

export type Product = Tables<'products'>;

export function useProducts(search = '') {
  const term = search.trim();
  return useQuery({
    queryKey: ['products', 'list', term],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase
        .from('products')
        .select('*')
        .is('archived_at', null)
        .order('name', { ascending: true });
      if (term) {
        const like = `%${term}%`;
        query = query.or(`code.ilike.${like},name.ilike.${like}`);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}
