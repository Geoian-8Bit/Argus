import { createContext } from 'react';
import type { Warehouse } from './useWarehouses';

export interface WarehouseContextValue {
  /** Almacenes a los que accede el usuario. */
  warehouses: Warehouse[];
  /** Almacén activo. null mientras carga o si el usuario no tiene ninguno. */
  current: Warehouse | null;
  /** Atajo: id del almacén activo, que es lo que filtran casi todas las consultas. */
  currentId: string | null;
  loading: boolean;
  error: Error | null;
  selectWarehouse: (id: string) => void;
}

export const WarehouseContext = createContext<WarehouseContextValue | null>(null);
