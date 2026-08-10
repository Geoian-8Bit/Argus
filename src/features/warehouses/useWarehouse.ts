import { useContext } from 'react';
import { WarehouseContext, type WarehouseContextValue } from './WarehouseContext';

export function useWarehouse(): WarehouseContextValue {
  const ctx = useContext(WarehouseContext);
  if (!ctx) {
    throw new Error('useWarehouse debe usarse dentro de <WarehouseProvider>');
  }
  return ctx;
}
