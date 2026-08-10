import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/useAuth';
import { WarehouseContext, type WarehouseContextValue } from './WarehouseContext';
import { useWarehouses } from './useWarehouses';
import { pickWarehouse } from './pickWarehouse';

const STORAGE_KEY = 'argus.warehouse';

function readStored(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Modo privado o almacenamiento bloqueado: se elige el primero cada vez.
    return null;
  }
}

function writeStored(id: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Sin persistencia no se rompe nada: la selección vive en memoria.
  }
}

interface WarehouseProviderProps {
  children: ReactNode;
}

/**
 * Almacén activo de la sesión. Todo lo que se consulta (productos, grupos,
 * movimientos, métricas) va filtrado por él, así que vive por encima de las
 * páginas y se recuerda entre visitas.
 */
export function WarehouseProvider({ children }: WarehouseProviderProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isPending, error } = useWarehouses();
  const [selectedId, setSelectedId] = useState<string | null>(() => readStored());

  const warehouses = useMemo(() => data ?? [], [data]);

  const current = useMemo(() => pickWarehouse(warehouses, selectedId), [warehouses, selectedId]);

  useEffect(() => {
    if (current && current.id !== selectedId) {
      setSelectedId(current.id);
      writeStored(current.id);
    }
  }, [current, selectedId]);

  const selectWarehouse = useCallback(
    (id: string) => {
      setSelectedId(id);
      writeStored(id);
      // Los datos en caché son de otro almacén: se descartan para no enseñar
      // stock ajeno durante el parpadeo del cambio.
      void queryClient.invalidateQueries();
    },
    [queryClient],
  );

  const value = useMemo<WarehouseContextValue>(
    () => ({
      warehouses,
      current,
      currentId: current?.id ?? null,
      loading: !!user && isPending,
      error: error ?? null,
      selectWarehouse,
    }),
    [warehouses, current, user, isPending, error, selectWarehouse],
  );

  return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>;
}
