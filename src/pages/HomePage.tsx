import { Link } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  TriangleAlert,
  Activity,
  Inbox,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useDashboardStats } from '@/features/dashboard/useDashboardStats';
import { useMovements } from '@/features/movements/useMovements';
import { MovementItem } from '@/features/movements/MovementItem';
import { Card, EmptyState, Skeleton, StatTile } from '@/components/ui';
import { cn } from '@/lib/utils';

function greeting(): string {
  const h = new Date().getHours();
  if (h >= 6 && h < 13) return 'Buenos días';
  if (h >= 13 && h < 21) return 'Buenas tardes';
  return 'Buenas noches';
}

function todayLabel(): string {
  return new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
}

interface ActionCardProps {
  to: string;
  tone: 'in' | 'out';
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

function ActionCard({ to, tone, icon: Icon, title, subtitle }: ActionCardProps) {
  const isIn = tone === 'in';
  return (
    <Link
      to={to}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-0 active:shadow-sm"
    >
      <span
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-xl',
          isIn ? 'bg-ok/15 text-ok' : 'bg-destructive/15 text-destructive',
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="flex items-end justify-between">
        <div>
          <p className="font-display text-base font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <ChevronRight
          className="h-4 w-4 text-muted-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

export function HomePage() {
  const { user } = useAuth();
  const stats = useDashboardStats();
  const recent = useMovements(5);
  const name = user?.email?.split('@')[0] ?? '';
  const lowStock = stats.data?.lowStock ?? 0;

  return (
    <div className="space-y-7">
      <header className="space-y-0.5">
        <p className="text-sm capitalize text-muted-foreground">
          {greeting()} · {todayLabel()}
        </p>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {name ? `Hola, ${name}` : 'Bienvenido'}
        </h2>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <ActionCard
          to="/scan?action=in"
          tone="in"
          icon={ArrowDownToLine}
          title="Añadir"
          subtitle="Entrada de stock"
        />
        <ActionCard
          to="/scan?action=out"
          tone="out"
          icon={ArrowUpFromLine}
          title="Retirar"
          subtitle="Salida de stock"
        />
      </div>

      <section className="space-y-2.5">
        <h3 className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Resumen
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {stats.isLoading ? (
            <>
              <Skeleton className="h-[5.25rem]" />
              <Skeleton className="h-[5.25rem]" />
              <Skeleton className="h-[5.25rem]" />
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
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Actividad reciente
          </h3>
          <Link
            to="/history"
            className="text-xs font-medium text-brand underline-offset-2 hover:underline"
          >
            Ver todo
          </Link>
        </div>

        {recent.isLoading ? (
          <Card className="space-y-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
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
