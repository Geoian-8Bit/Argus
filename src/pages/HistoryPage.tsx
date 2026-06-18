import { useState } from 'react';
import { Inbox, History as HistoryIcon, Search, SearchX } from 'lucide-react';
import {
  useMovements,
  type MovementWithProduct,
  type MovementType,
} from '@/features/movements/useMovements';
import { MovementItem } from '@/features/movements/MovementItem';
import { dayKey, dayLabel } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { PageHeader, Card, EmptyState, Skeleton, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface DayGroup {
  key: string;
  label: string;
  items: MovementWithProduct[];
}

function groupByDay(movements: MovementWithProduct[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const m of movements) {
    const key = dayKey(m.created_at);
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) {
      group = { key, label: dayLabel(m.created_at), items: [] };
      groups.push(group);
    }
    group.items.push(m);
  }
  return groups;
}

type TypeFilter = 'all' | MovementType;

const FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'in', label: 'Entradas' },
  { value: 'out', label: 'Salidas' },
];

export function HistoryPage() {
  const movements = useMovements(200);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TypeFilter>('all');
  const term = useDebouncedValue(search.trim().toLowerCase(), 200);

  const all = movements.data ?? [];
  const filtered = all.filter((m) => {
    if (filter !== 'all' && m.type !== filter) return false;
    if (term) {
      const haystack =
        `${m.products?.name ?? ''} ${m.products?.code ?? ''} ${m.products?.variant ?? ''}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
  const isFiltering = term.length > 0 || filter !== 'all';

  return (
    <div className="space-y-5">
      <PageHeader title="Historial" subtitle="Entradas y salidas de stock registradas." />

      <div className="space-y-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            inputMode="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por producto o código"
            aria-label="Buscar en el historial"
            className="pl-9"
          />
        </div>

        <div
          role="tablist"
          aria-label="Filtrar por tipo"
          className="flex gap-1 rounded-lg bg-muted p-1"
        >
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.value)}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {movements.isLoading ? (
        <Card className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      ) : movements.isError ? (
        <EmptyState
          icon={HistoryIcon}
          title="No se pudo cargar el historial"
          description={
            movements.error instanceof Error ? movements.error.message : 'Inténtalo de nuevo.'
          }
        />
      ) : filtered.length > 0 ? (
        <div className="space-y-5">
          {groupByDay(filtered).map((group) => (
            <section key={group.key} className="space-y-2">
              <h3 className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h3>
              <Card>
                <ul className="divide-y divide-border px-4">
                  {group.items.map((m) => (
                    <MovementItem key={m.id} movement={m} timeFormat="time" />
                  ))}
                </ul>
              </Card>
            </section>
          ))}
        </div>
      ) : isFiltering ? (
        <EmptyState
          icon={SearchX}
          title="Sin resultados"
          description="Ningún movimiento coincide con la búsqueda o el filtro."
        />
      ) : (
        <EmptyState
          icon={Inbox}
          title="Sin movimientos"
          description="Cuando registres entradas o salidas aparecerán aquí."
        />
      )}
    </div>
  );
}
