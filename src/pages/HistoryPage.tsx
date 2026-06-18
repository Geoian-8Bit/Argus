import { Inbox, History as HistoryIcon } from 'lucide-react';
import { useMovements, type MovementWithProduct } from '@/features/movements/useMovements';
import { MovementItem } from '@/features/movements/MovementItem';
import { dayKey, dayLabel } from '@/lib/format';
import { PageHeader, Card, EmptyState, Skeleton } from '@/components/ui';

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

export function HistoryPage() {
  const movements = useMovements(100);

  return (
    <div className="space-y-5">
      <PageHeader title="Historial" subtitle="Entradas y salidas de stock registradas." />

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
      ) : movements.data && movements.data.length > 0 ? (
        <div className="space-y-5">
          {groupByDay(movements.data).map((group) => (
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
