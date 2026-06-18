import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';

export type Product = Tables<'products'>;

export function productByCodeKey(code: string) {
  return ['product', 'by-code', code] as const;
}

export function useProductByCode(code: string | null) {
  return useQuery({
    queryKey: productByCodeKey(code ?? ''),
    enabled: !!code,
    queryFn: async (): Promise<Product | null> => {
      if (!code) return null;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('code', code)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });
}
