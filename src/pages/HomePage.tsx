import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  TriangleAlert,
  Activity,
  Inbox,
  ChevronRight,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useDashboardStats } from '@/features/dashboard/useDashboardStats';
import { useMovements } from '@/features/movements/useMovements';
import { MovementItem } from '@/features/movements/MovementItem';
import { AlertProductsModal } from '@/features/dashboard/AlertProductsModal';
import { useAlertProducts } from '@/features/dashboard/useAlertProducts';
import { useSales } from '@/features/dashboard/useSales';
import { todayRange } from '@/features/dashboard/period';
import { useRole } from '@/features/auth/useRole';
import { Button, Card, EmptyState, Skeleton, StatTile, StockBadge } from '@/components/ui';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';

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

/**
 * Resumen de arranque del comercial: lo vendido hoy en su almacén y lo que
 * tiene que reponer. Va en su propio componente para que sus consultas solo se
 * lancen cuando el rol es comercial.
 */
function ComercialSummary() {
  // El rango es el día natural: la clave de la consulta no cambia hasta mañana.
  const period = useMemo(() => todayRange(), []);
  const sales = useSales(period);
  const alerts = useAlertProducts();
  const [alertsOpen, setAlertsOpen] = useState(false);

  const revenue = sales.data?.revenue ?? 0;
  const alertList = alerts.data ?? [];
  // En Inicio caben unos pocos; el resto se ven en el modal.
  const preview = alertList.slice(0, 5);

  return (
    <>
      <section className="space-y-2.5">
        <h3 className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Hoy · {period.label}
        </h3>

        {sales.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : sales.isError ? (
          <EmptyState
            icon={TriangleAlert}
            title="No se pudieron cargar tus ventas"
            description="Revisa tu conexión e inténtalo de nuevo."
            action={
              <Button
                variant="outline"
                size="sm"
                className="w-auto"
                onClick={() => void sales.refetch()}
              >
                Reintentar
              </Button>
            }
          />
        ) : (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Ganancias del día</p>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Wallet className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-1.5 font-sans text-4xl font-semibold leading-none tracking-tight">
              {formatMoney(revenue)}
            </p>

            {/* Mismo reparto que el panel de Ventas: contratos + piezas = total. */}
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Contratos</p>
                <p className="mt-0.5 text-lg font-semibold leading-tight">
                  {formatMoney(sales.data?.contractsRevenue ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Piezas</p>
                <p className="mt-0.5 text-lg font-semibold leading-tight">
                  {formatMoney(sales.data?.piecesRevenue ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Uds</p>
                <p className="mt-0.5 text-lg font-semibold leading-tight tabular-nums">
                  {sales.data?.unitsSold ?? 0}
                </p>
              </div>
            </div>
          </Card>
        )}
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Quedan pocos
            {alertList.length > 0 && <span className="tabular-nums"> ({alertList.length})</span>}
          </h3>
          {alertList.length > preview.length && (
            <button
              type="button"
              onClick={() => setAlertsOpen(true)}
              className="text-xs font-medium text-brand underline-offset-2 hover:underline"
            >
              Ver todos
            </button>
          )}
        </div>

        {alerts.isLoading ? (
          <Card className="space-y-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </Card>
        ) : preview.length > 0 ? (
          <Card>
            <ul className="divide-y divide-border px-4">
              {preview.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {p.name}
                      {p.variant ? (
                        <span className="text-muted-foreground"> · {p.variant}</span>
                      ) : null}
                    </p>
                    <p className="truncate font-mono text-xs text-muted-foreground">{p.code}</p>
                  </div>
                  <StockBadge stock={p.stock ?? 0} minStock={p.min_stock ?? undefined} />
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <EmptyState
            icon={Package}
            title="Todo con stock suficiente"
            description="Ningún producto de tu almacén está bajo mínimos."
          />
        )}
      </section>

      {alertsOpen && (
        <AlertProductsModal linkToDetail={false} onClose={() => setAlertsOpen(false)} />
      )}
    </>
  );
}

export function HomePage() {
  const role = useRole();
  const isAdmin = role.data === 'admin';
  // El comercial trabaja sin QR: sus accesos llevan al alta manual.
  const isComercial = role.data === 'comercial';
  const movePath = isComercial ? '/movement' : '/scan';
  const stats = useDashboardStats();
  const recent = useMovements({ limit: 5 });
  const lowStock = stats.data?.lowStock ?? 0;
  const [alertsOpen, setAlertsOpen] = useState(false);

  return (
    <div className="space-y-7">
      <header className="space-y-1">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Control de stock por QR
        </h2>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? 'Escanea el código de un producto para registrar entradas y salidas. Aquí tienes el resumen del inventario y los últimos movimientos.'
            : isComercial
              ? 'Elige el producto de tu almacén y registra la entrada o la salida, con su cliente.'
              : 'Escanea el código de un producto para registrar una entrada o una salida de stock.'}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <ActionCard
          to={`${movePath}?action=in`}
          tone="in"
          icon={ArrowDownToLine}
          title="Añadir"
          subtitle="Entrada de stock"
        />
        <ActionCard
          to={`${movePath}?action=out`}
          tone="out"
          icon={ArrowUpFromLine}
          title="Retirar"
          subtitle="Salida de stock"
        />
      </div>

      {isComercial && <ComercialSummary />}

      {isAdmin && (
        <>
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
                  <StatTile
                    label="Productos"
                    value={stats.data?.totalProducts ?? 0}
                    icon={Package}
                  />
                  <StatTile
                    label="Quedan pocos"
                    value={lowStock}
                    icon={TriangleAlert}
                    tone={lowStock > 0 ? 'destructive' : 'default'}
                    onClick={lowStock > 0 ? () => setAlertsOpen(true) : undefined}
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
        </>
      )}

      {alertsOpen && <AlertProductsModal onClose={() => setAlertsOpen(false)} />}
    </div>
  );
}
