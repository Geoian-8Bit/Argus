import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Warehouse } from './useWarehouses';

/** Miembros de cada almacén, indexados por almacén. Solo lo carga un admin (RLS). */
export function useWarehouseMembers() {
  return useQuery({
    queryKey: ['warehouses', 'members'],
    queryFn: async (): Promise<Record<string, string[]>> => {
      const { data, error } = await supabase
        .from('warehouse_members')
        .select('warehouse_id,user_id');
      if (error) throw new Error(error.message);
      const byWarehouse: Record<string, string[]> = {};
      for (const row of data ?? []) {
        (byWarehouse[row.warehouse_id] ??= []).push(row.user_id);
      }
      return byWarehouse;
    },
  });
}

function useInvalidateWarehouses() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['warehouses'] });
  };
}

export function useCreateWarehouse() {
  const invalidate = useInvalidateWarehouses();

  return useMutation({
    mutationFn: async (name: string): Promise<Warehouse> => {
      const trimmed = name.trim();
      if (!trimmed) {
        throw new Error('El nombre del almacén es obligatorio.');
      }
      // Se coloca al final del orden actual.
      const { data: last, error: lastError } = await supabase
        .from('warehouses')
        .select('position')
        .order('position', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();
      if (lastError) throw new Error(lastError.message);

      const { data, error } = await supabase
        .from('warehouses')
        .insert({ name: trimmed, position: (last?.position ?? -1) + 1 })
        .select()
        .single();
      if (error) {
        if (error.code === '23505') throw new Error(`Ya existe un almacén llamado "${trimmed}".`);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useRenameWarehouse() {
  const invalidate = useInvalidateWarehouses();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }): Promise<void> => {
      const trimmed = name.trim();
      if (!trimmed) {
        throw new Error('El nombre del almacén es obligatorio.');
      }
      const { error } = await supabase.from('warehouses').update({ name: trimmed }).eq('id', id);
      if (error) {
        if (error.code === '23505') throw new Error(`Ya existe un almacén llamado "${trimmed}".`);
        throw new Error(error.message);
      }
    },
    onSuccess: invalidate,
  });
}

/**
 * Archiva un almacén: desaparece del selector pero no se borra nada. No se
 * elimina de verdad a propósito: sus productos y movimientos son histórico, y
 * las claves ajenas lo impedirían igualmente.
 */
export function useArchiveWarehouse() {
  const invalidate = useInvalidateWarehouses();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('warehouses')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

/** Da acceso a una persona a un almacén. Se usa al crear la cuenta. */
export function useAddWarehouseMember() {
  const invalidate = useInvalidateWarehouses();

  return useMutation({
    mutationFn: async ({
      warehouseId,
      userId,
    }: {
      warehouseId: string;
      userId: string;
    }): Promise<void> => {
      const { error } = await supabase
        .from('warehouse_members')
        .insert({ warehouse_id: warehouseId, user_id: userId });
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

export interface SetWarehouseMembersInput {
  warehouseId: string;
  /** Usuarios que deben quedar con acceso; el resto lo pierde. */
  userIds: string[];
}

export function useSetWarehouseMembers() {
  const invalidate = useInvalidateWarehouses();

  return useMutation({
    mutationFn: async ({ warehouseId, userIds }: SetWarehouseMembersInput): Promise<void> => {
      const { data: current, error: readError } = await supabase
        .from('warehouse_members')
        .select('user_id')
        .eq('warehouse_id', warehouseId);
      if (readError) throw new Error(readError.message);

      const before = new Set((current ?? []).map((m) => m.user_id));
      const after = new Set(userIds);
      const toAdd = userIds.filter((id) => !before.has(id));
      const toRemove = [...before].filter((id) => !after.has(id));

      if (toAdd.length > 0) {
        const { error } = await supabase
          .from('warehouse_members')
          .insert(toAdd.map((user_id) => ({ warehouse_id: warehouseId, user_id })));
        if (error) throw new Error(error.message);
      }
      if (toRemove.length > 0) {
        const { error } = await supabase
          .from('warehouse_members')
          .delete()
          .eq('warehouse_id', warehouseId)
          .in('user_id', toRemove);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: invalidate,
  });
}
