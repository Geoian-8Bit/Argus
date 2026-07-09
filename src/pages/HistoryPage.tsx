import { useState } from 'react';
import {
  Inbox,
  History as HistoryIcon,
  Search,
  SearchX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  useMovements,
  type MovementWithProduct,
  type MovementType,
} from '@/features/movements/useMovements';
import { MovementItem } from '@/features/movements/MovementItem';
import { dayKey, dayLabel } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import {
  PageHeader,
  Card,
  EmptyState,
  Skeleton,
  Input,
  IconButton,
  Segmented,
  type SegmentedOption,
} from '@/components/ui';

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

const TYPE_FILTERS: SegmentedOption<TypeFilter>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'in', label: 'Entradas' },
  { value: 'out', label: 'Salidas' },
];

type PeriodMode = 'month' | 'day';

const PERIOD_MODES: SegmentedOption<PeriodMode>[] = [
  { value: 'month', label: 'Mes' },
  { value: 'day', label: 'Día' },
];

/** Clave de mes local "YYYY-MM". */
function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Clave de día local "YYYY-MM-DD" (formato de <input type="date">). */
function dayKeyOf(date: Date): string {
  return `${monthKeyOf(date)}-${String(date.getDate()).padStart(2, '0')}`;
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  return monthKeyOf(new Date(y, m - 1 + delta, 1));
}

/** Rango [inicio de mes, inicio del mes siguiente) en hora local, como ISO. */
function monthRange(month: string): { from: string; to: string } {
  const [y, m] = month.split('-').map(Number);
  return {
    from: new Date(y, m - 1, 1).toISOString(),
    to: new Date(y, m, 1).toISOString(),
  };
}

/** Rango [inicio del día, inicio del día siguiente) en hora local, como ISO. */
function dayRange(day: string): { from: string; to: string } {
  const [y, m, d] = day.split('-').map(Number);
  return {
    from: new Date(y, m - 1, d).toISOString(),
    to: new Date(y, m - 1, d + 1).toISOString(),
  };
}

const monthFmt = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' });

function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return monthFmt.format(new Date(y, m - 1, 1));
}

export function HistoryPage() {
  const [mode, setMode] = useState<PeriodMode>('month');
  const [month, setMonth] = useState(() => monthKeyOf(new Date()));
  const [day, setDay] = useState(() => dayKeyOf(new Date()));
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TypeFilter>('all');
  const term = useDebouncedValue(search.trim().toLowerCase(), 200);

  const currentMonth = monthKeyOf(new Date());
  const today = dayKeyOf(new Date());
  const range = mode === 'month' ? monthRange(month) : dayRange(day);
  const movements = useMovements(range);

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

        <Segmented
          value={filter}
          onChange={setFilter}
          options={TYPE_FILTERS}
          ariaLabel="Filtrar por tipo"
        />

        <div className="flex items-center gap-2">
          <Segmented
            value={mode}
            onChange={setMode}
            options={PERIOD_MODES}
            ariaLabel="Ver por mes o por día"
            className="w-32 shrink-0"
          />
          {mode === 'month' ? (
            <div className="flex h-11 flex-1 items-center justify-between rounded-md border border-input bg-background px-1">
              <IconButton
                aria-label="Mes anterior"
                className="h-9 w-9"
                onClick={() => setMonth(shiftMonth(month, -1))}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </IconButton>
              <span className="text-sm font-medium first-letter:uppercase">
                {monthLabel(month)}
              </span>
              <IconButton
                aria-label="Mes siguiente"
                className="h-9 w-9"
                disabled={month >= currentMonth}
                onClick={() => setMonth(shiftMonth(month, 1))}
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </IconButton>
            </div>
          ) : (
            <div className="flex-1">
              <Input
                type="date"
                value={day}
                max={today}
                onChange={(e) => {
                  if (e.target.value) setDay(e.target.value);
                }}
                aria-label="Día del historial"
              />
            </div>
          )}
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
          description={
            mode === 'month'
              ? `No hay movimientos en ${monthLabel(month)}.`
              : 'No hay movimientos en el día seleccionado.'
          }
        />
      )}
    </div>
  );
}
