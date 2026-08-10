import { ChevronDown, Warehouse as WarehouseIcon } from 'lucide-react';
import { useWarehouse } from './useWarehouse';

/**
 * Selector de almacén de la cabecera. Solo aparece si hay más de uno al que
 * elegir: un comercial con un único almacén no gana nada viéndolo.
 */
export function WarehouseSwitcher() {
  const { warehouses, current, selectWarehouse } = useWarehouse();

  if (warehouses.length < 2 || !current) return null;

  return (
    <div className="relative min-w-0 flex-1">
      <WarehouseIcon
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <select
        aria-label="Almacén activo"
        value={current.id}
        onChange={(e) => selectWarehouse(e.target.value)}
        className="h-9 w-full appearance-none truncate rounded-md border border-input bg-background py-0 pl-8 pr-7 text-sm font-medium text-foreground outline-none transition-colors duration-200 ease-out focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}
