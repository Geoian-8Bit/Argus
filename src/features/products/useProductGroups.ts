import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';

export type ProductGroup = Tables<'product_groups'>;

export function useProductGroups() {
  return useQuery({
    queryKey: ['product-groups', 'list'],
    queryFn: async (): Promise<ProductGroup[]> => {
      const { data, error } = await supabase
        .from('product_groups')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}

export interface SaveProductGroupInput {
  /** id del grupo a editar; ausente para crear uno nuevo. */
  id?: string;
  name: string;
  /** Productos que deben quedar en el grupo; el resto se desvincula. */
  productIds: string[];
}

/** Crea o edita un grupo y sincroniza qué productos pertenecen a él. */
export function useSaveProductGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveProductGroupInput): Promise<ProductGroup> => {
      const name = input.name.trim();
      if (!name) {
        throw new Error('El nombre del grupo es obligatorio.');
      }

      let group: ProductGroup;
      if (input.id) {
        const { data, error } = await supabase
          .from('product_groups')
          .update({ name })
          .eq('id', input.id)
          .select()
          .single();
        if (error) {
          if (error.code === '23505') throw new Error(`Ya existe un grupo llamado "${name}".`);
          throw new Error(error.message);
        }
        group = data;
      } else {
        const { data, error } = await supabase
          .from('product_groups')
          .insert({ name })
          .select()
          .single();
        if (error) {
          if (error.code === '23505') throw new Error(`Ya existe un grupo llamado "${name}".`);
          throw new Error(error.message);
        }
        group = data;
      }

      // Vincula los productos seleccionados…
      if (input.productIds.length > 0) {
        const { error } = await supabase
          .from('products')
          .update({ group_id: group.id })
          .in('id', input.productIds);
        if (error) throw new Error(error.message);
      }
      // …y desvincula los que estaban en el grupo y ya no están marcados.
      let removeQuery = supabase
        .from('products')
        .update({ group_id: null })
        .eq('group_id', group.id);
      if (input.productIds.length > 0) {
        removeQuery = removeQuery.not('id', 'in', `(${input.productIds.join(',')})`);
      }
      const { error: removeError } = await removeQuery;
      if (removeError) throw new Error(removeError.message);

      return group;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['product-groups'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/** Elimina un grupo; sus productos quedan "sin grupo" (FK on delete set null). */
export function useDeleteProductGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('product_groups').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['product-groups'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCreateProductGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string): Promise<ProductGroup> => {
      const trimmed = name.trim();
      if (!trimmed) {
        throw new Error('El nombre del grupo es obligatorio.');
      }
      const { data, error } = await supabase
        .from('product_groups')
        .insert({ name: trimmed })
        .select()
        .single();

      if (error) {
        // Nombre duplicado (índice único sin mayúsculas): reutilizamos el existente.
        if (error.code === '23505') {
          const { data: groups, error: selectError } = await supabase
            .from('product_groups')
            .select('*');
          const existing = (groups ?? []).find(
            (g) => g.name.toLowerCase() === trimmed.toLowerCase(),
          );
          if (existing) return existing;
          throw new Error(selectError?.message ?? `Ya existe un grupo llamado "${trimmed}".`);
        }
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['product-groups'] });
    },
  });
}
