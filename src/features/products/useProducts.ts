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
        .order('position', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true });
      if (term) {
        // Buscando: incluye también los archivados (se marcan aparte) para
        // poder encontrarlos y reactivarlos.
        const like = `%${term}%`;
        query = query.or(`code.ilike.${like},name.ilike.${like}`);
      } else {
        // Navegando: todo lo no archivado. Los desactivados (stock = -1) llegan
        // también, y el listado los separa en su propia sección "No se usan":
        // si no, no habría forma de encontrarlos salvo buscándolos por nombre.
        query = query.is('archived_at', null);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      // price es numeric en Postgres y viaja como string; lo normalizamos a number.
      return (data ?? []).map((p) => ({ ...p, price: Number(p.price) || 0 }));
    },
  });
}
