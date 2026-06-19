import {
  Boxes,
  Package,
  TriangleAlert,
  PackageX,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Wallet,
  Coins,
} from 'lucide-react';
import { useProductStats, type ProductStat } from '@/features/dashboard/useProductStats';
import { useActivity } from '@/features/dashboard/useActivity';
import { useMonthlySales } from '@/features/dashboard/useMonthlySales';
import { LOW_STOCK_THRESHOLD } from '@/features/products/constants';
import { PageHeader, Card, StatTile, StockBadge, Skeleton, EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/format';
import { Link } from 'react-router-dom';

function ActivityChart() {
  const activity = useActivity(7);
  if (activity.isLoading) return <Skeleton className="h-32 w-full" />;
  const days = activity.data ?? [];
  const max = Math.max(1, ...days.flatMap((d) => [d.inQty, d.outQty]));
  const totalIn = days.reduce((s, d) => s + d.inQty, 0);
  const totalOut = days.reduce((s, d) => s + d.outQty, 0);
  const bar = (v: number) => (v <= 0 ? 0 : Math.max(4, Math.round((v / max) * 88)));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ok" /> Entradas{' '}
          <strong className="tabular-nums text-foreground">{totalIn}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-destructive" /> Salidas{' '}
          <strong className="tabular-nums text-foreground">{totalOut}</strong>
        </span>
      </div>
      <div className="flex h-28 items-end justify-between gap-1.5">
        {days.map((d) => (
          <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-[88px] items-end justify-center gap-1">
              <span
                className="w-2.5 rounded-t bg-ok"
                style={{ height: `${bar(d.inQty)}px` }}
                title={`Entradas: ${d.inQty}`}
              />
              <span
                className="w-2.5 rounded-t bg-destructive"
                style={{ height: `${bar(d.outQty)}px` }}
                title={`Salidas: ${d.outQty}`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RankBars({ items, color }: { items: ProductStat[]; color: string }) {
  const max = Math.max(1, ...items.map((i) => i.total_out));
  return (
    <ul className="space-y-3">
      {items.map((p) => (
        <li key={p.id}>
          <Link to={`/products/${p.id}`} className="block">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-medium">
                {p.name}
                {p.variant ? <span className="text-muted-foreground"> · {p.variant}</span> : null}
              </span>
              <span className="shrink-0 text-sm font-semibold tabular-nums">{p.total_out}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <span
                className={cn('block h-full rounded-full', color)}
                style={{ width: `${Math.round((p.total_out / max) * 100)}%` }}
              />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Ranking de productos por ingresos por ventas.
function RevenueBars({ items }: { items: ProductStat[] }) {
  const max = Math.max(1, ...items.map((i) => i.total_revenue));
  return (
    <ul className="space-y-3">
      {items.map((p) => (
        <li key={p.id}>
          <Link to={`/products/${p.id}`} className="block">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-medium">
                {p.name}
                {p.variant ? <span className="text-muted-foreground"> · {p.variant}</span> : null}
              </span>
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {formatMoney(p.total_revenue)}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-brand"
                style={{ width: `${Math.round((p.total_revenue / max) * 100)}%` }}
              />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Resumen de ventas del mes en curso: unidades, ingresos y diferencia sobre el base.
function MonthlySalesCard() {
  const sales = useMonthlySales();
  if (sales.isLoading) return <Skeleton className="h-[5.25rem] w-full" />;
  const d = sales.data;
  if (!d) return null;
  const diffPositive = d.diff >= 0;
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatTile label="Uds vendidas" value={d.unitsSold} icon={Coins} />
      <StatTile label="Ingresos" value={formatMoney(d.revenue)} icon={Wallet} />
      <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <span
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg',
            diffPositive ? 'bg-ok/15 text-ok' : 'bg-destructive/15 text-destructive',
          )}
        >
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
        </span>
        <p
          className={cn(
            'mt-2 font-display text-2xl font-semibold leading-none tabular-nums',
            diffPositive ? 'text-ok' : 'text-destructive',
          )}
        >
          {diffPositive ? '+' : ''}
          {formatMoney(d.diff)}
        </p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">Sobre el base</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const stats = useProductStats();
  const data = stats.data ?? [];

  const totalProducts = data.length;
  const units = data.reduce((s, p) => s + p.stock, 0);
  const warehouseValue = data.reduce((s, p) => s + p.stock * p.price, 0);
  const low = data.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length;
  const out = data.filter((p) => p.stock <= 0).length;

  const topOut = [...data]
    .filter((p) => p.total_out > 0)
    .sort((a, b) => b.total_out - a.total_out)
    .slice(0, 5);
  const topRevenue = [...data]
    .filter((p) => p.total_revenue > 0)
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 5);
  const lowest = [...data].sort((a, b) => a.stock - b.stock).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Panel" subtitle="Métricas del inventario y de la actividad." />

      {/* KPIs */}
      {stats.isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[5.25rem]" />
          <Skeleton className="h-[5.25rem]" />
          <Skeleton className="col-span-2 h-[5.25rem]" />
          <Skeleton className="h-[5.25rem]" />
          <Skeleton className="h-[5.25rem]" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Productos" value={totalProducts} icon={Package} />
          <StatTile label="Unidades en stock" value={units} icon={Boxes} />
          <StatTile
            label="Valor de almacén (a precio base)"
            value={formatMoney(warehouseValue)}
            icon={Wallet}
            className="col-span-2"
          />
          <StatTile
            label="Stock bajo"
            value={low}
            icon={TriangleAlert}
            tone={low > 0 ? 'warning' : 'default'}
          />
          <StatTile
            label="Agotados"
            value={out}
            icon={PackageX}
            tone={out > 0 ? 'warning' : 'default'}
          />
        </div>
      )}

      {/* Ventas del mes */}
      <section className="space-y-2.5">
        <h3 className="flex items-center gap-1.5 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Coins className="h-3.5 w-3.5" aria-hidden="true" /> Ventas de este mes
        </h3>
        <MonthlySalesCard />
      </section>

      {/* Actividad 7 días */}
      <section className="space-y-2.5">
        <h3 className="flex items-center gap-1.5 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" /> Actividad (7 días)
        </h3>
        <Card className="p-4">
          <ActivityChart />
        </Card>
      </section>

      {/* Más salidas */}
      <section className="space-y-2.5">
        <h3 className="flex items-center gap-1.5 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" /> Lo que más sale
        </h3>
        {stats.isLoading ? (
          <Card className="p-4">
            <Skeleton className="h-24 w-full" />
          </Card>
        ) : topOut.length > 0 ? (
          <Card className="p-4">
            <RankBars items={topOut} color="bg-destructive" />
          </Card>
        ) : (
          <EmptyState
            icon={TrendingDown}
            title="Sin salidas todavía"
            description="Aún no se ha retirado stock."
          />
        )}
      </section>

      {/* Ingresos por producto */}
      <section className="space-y-2.5">
        <h3 className="flex items-center gap-1.5 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> Más ingresos
        </h3>
        {stats.isLoading ? (
          <Card className="p-4">
            <Skeleton className="h-24 w-full" />
          </Card>
        ) : topRevenue.length > 0 ? (
          <Card className="p-4">
            <RevenueBars items={topRevenue} />
          </Card>
        ) : (
          <EmptyState
            icon={TrendingUp}
            title="Sin ventas todavía"
            description="Cuando registres salidas con precio aparecerán aquí."
          />
        )}
      </section>

      {/* Quedan menos */}
      <section className="space-y-2.5">
        <h3 className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Quedan menos
        </h3>
        {stats.isLoading ? (
          <Card className="p-4">
            <Skeleton className="h-24 w-full" />
          </Card>
        ) : lowest.length > 0 ? (
          <Card>
            <ul className="divide-y divide-border px-4">
              {lowest.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/products/${p.id}`}
                    className="flex items-center gap-3 py-3 transition-colors hover:opacity-80"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {p.name}
                        {p.variant ? (
                          <span className="text-muted-foreground"> · {p.variant}</span>
                        ) : null}
                      </p>
                      <p className="truncate font-mono text-xs text-muted-foreground">{p.code}</p>
                    </div>
                    <StockBadge stock={p.stock} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <EmptyState
            icon={Package}
            title="Sin productos"
            description="Crea productos para ver métricas."
          />
        )}
      </section>
    </div>
  );
}
