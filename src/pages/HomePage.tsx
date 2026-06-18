import { Link } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  TriangleAlert,
  Activity,
  Inbox,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useDashboardStats } from '@/features/dashboard/useDashboardStats';
import { useMovements } from '@/features/movements/useMovements';
import { MovementItem } from '@/features/movements/MovementItem';
import { Card, EmptyState, Skeleton, StatTile, buttonClasses } from '@/components/ui';

function greeting(): string {
  const h = new Date().getHours();
  if (h >= 6 && h < 13) return 'Buenos días';
  if (h >= 13 && h < 21) return 'Buenas tardes';
  return 'Buenas noches';
}

export function HomePage() {
  const { user } = useAuth();
  const stats = useDashboardStats();
  const recent = useMovements(5);
  const name = user?.email?.split('@')[0] ?? '';
  const lowStock = stats.data?.lowStock ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{greeting()}</p>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {name ? `Hola, ${name}` : 'Bienvenido'}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.isLoading ? (
          <>
            <Skeleton className="h-[4.75rem]" />
            <Skeleton className="h-[4.75rem]" />
            <Skeleton className="h-[4.75rem]" />
          </>
        ) : (
          <>
            <StatTile label="Productos" value={stats.data?.totalProducts ?? 0} icon={Package} />
            <StatTile
              label="Stock bajo"
              value={lowStock}
              icon={TriangleAlert}
              tone={lowStock > 0 ? 'warning' : 'default'}
            />
            <StatTile label="Hoy" value={stats.data?.movementsToday ?? 0} icon={Activity} />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/scan?action=in"
          className={buttonClasses('primary', 'lg', 'h-28 w-full flex-col gap-2')}
        >
          <ArrowDownToLine className="h-6 w-6" aria-hidden="true" />
          Añadir
        </Link>
        <Link
          to="/scan?action=out"
          className={buttonClasses('destructive', 'lg', 'h-28 w-full flex-col gap-2')}
        >
          <ArrowUpFromLine className="h-6 w-6" aria-hidden="true" />
          Retirar
        </Link>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold">Actividad reciente</h3>
          <Link
            to="/history"
            className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Ver todo
          </Link>
        </div>

        {recent.isLoading ? (
          <Card className="p-4">
            <Skeleton className="h-12 w-full" />
          </Card>
        ) : recent.data && recent.data.length > 0 ? (
          <Card>
            <ul className="divide-y divide-border px-4">
              {recent.data.map((m) => (
                <MovementItem key={m.id} movement={m} />
              ))}
            </ul>
          </Card>
        ) : (
          <EmptyState
            icon={Inbox}
            title="Sin movimientos todavía"
            description="Escanea un producto para registrar la primera entrada o salida."
          />
        )}
      </section>
    </div>
  );
}
