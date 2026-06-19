import { useMemo, useState, type ReactNode } from 'react';
import {
  Boxes,
  Package,
  TriangleAlert,
  PackageX,
  TrendingUp,
  BarChart3,
  Wallet,
  Coins,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  type LucideIcon,
} from 'lucide-react';
import { useProductStats, type ProductStat } from '@/features/dashboard/useProductStats';
import { useActivity } from '@/features/dashboard/useActivity';
import { useSales } from '@/features/dashboard/useSales';
import { periodRange, GRANULARITIES, type Granularity } from '@/features/dashboard/period';
import { useRole } from '@/features/auth/useRole';
import { ChecklistReviews } from '@/features/checklist/ChecklistReviews';
import {
  PageHeader,
  Card,
  StatTile,
  StockBadge,
  Skeleton,
  EmptyState,
  IconButton,
  Button,
  Segmented,
  Spinner,
} from '@/components/ui';
import { formatMoney } from '@/lib/format';
import { Link } from 'react-router-dom';

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={TriangleAlert}
      title="No se pudo cargar"
      description="Revisa tu conexión e inténtalo de nuevo."
      action={
        <Button variant="outline" size="sm" className="w-auto" onClick={onRetry}>
          Reintentar
        </Button>
      }
    />
  );
}

function SectionTitle({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-1.5 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
    </h3>
  );
}

function ActivityChart() {
  const activity = useActivity(7);
  if (activity.isLoading) return <Skeleton className="h-32 w-full" />;
  if (activity.isError) return <LoadError onRetry={() => void activity.refetch()} />;

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
          <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
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
            <span className="text-[10px] leading-tight text-muted-foreground">{d.label}</span>
            <span className="text-[10px] leading-none tabular-nums text-muted-foreground/70">
              {d.dayOfMonth}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type RankMetric = 'revenue' | 'units';

// Ranking único de productos con conmutador Unidades / Ingresos.
// La métrica activa se dibuja como barra; la otra acompaña en texto pequeño.
function TopProducts({ data }: { data: ProductStat[] }) {
  const [metric, setMetric] = useState<RankMetric>('revenue');
  const isRevenue = metric === 'revenue';

  const value = (p: ProductStat) => (isRevenue ? p.total_revenue : p.total_out);
  const ranked = [...data]
    .filter((p) => value(p) > 0)
    .sort((a, b) => value(b) - value(a))
    .slice(0, 5);
  const max = Math.max(1, ...ranked.map(value));

  return (
    <div className="space-y-3">
      <Segmented
        ariaLabel="Métrica del ranking"
        size="sm"
        value={metric}
        onChange={setMetric}
        options={[
          { value: 'revenue', label: 'Ingresos' },
          { value: 'units', label: 'Unidades' },
        ]}
      />
      {ranked.length > 0 ? (
        <Card className="p-4">
          <ul className="space-y-3">
            {ranked.map((p) => {
              const primary = isRevenue ? formatMoney(p.total_revenue) : `${p.total_out} uds`;
              const secondary = isRevenue ? `${p.total_out} uds` : formatMoney(p.total_revenue);
              return (
                <li key={p.id}>
                  <Link to={`/products/${p.id}`} className="block">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {p.name}
                        {p.variant ? (
                          <span className="text-muted-foreground"> · {p.variant}</span>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">{primary}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-brand"
                          style={{ width: `${Math.round((value(p) / max) * 100)}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {secondary}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="Sin ventas todavía"
          description="Cuando registres salidas con precio aparecerán aquí."
        />
      )}
    </div>
  );
}

// Ventas de un periodo elegible (semana/mes/trimestre/año) con navegación.
function PeriodSales() {
  const [granularity, setGranularity] = useState<Granularity>('month');
  const [offset, setOffset] = useState(0);
  const period = useMemo(() => periodRange(granularity, offset), [granularity, offset]);
  const sales = useSales(period);
  const d = sales.data;
  const diffPositive = (d?.diff ?? 0) >= 0;

  function changeGranularity(next: Granularity) {
    setGranularity(next);
    setOffset(0); // Al cambiar de escala, volvemos al periodo actual.
  }

  return (
    <div className="space-y-3">
      <Segmented
        ariaLabel="Escala de tiempo"
        value={granularity}
        onChange={changeGranularity}
        options={GRANULARITIES}
      />

      <div className="flex items-center justify-between gap-2">
        <IconButton aria-label="Periodo anterior" onClick={() => setOffset((o) => o - 1)}>
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </IconButton>
        <span className="text-sm font-semibold capitalize tabular-nums">{period.label}</span>
        <IconButton
          aria-label="Periodo siguiente"
          disabled={offset >= 0}
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </IconButton>
      </div>

      {sales.isLoading ? (
        <Skeleton className="h-[5.25rem] w-full" />
      ) : sales.isError ? (
        <LoadError onRetry={() => void sales.refetch()} />
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Uds vendidas" value={d?.unitsSold ?? 0} icon={Coins} />
          <StatTile label="Ingresos" value={formatMoney(d?.revenue ?? 0)} icon={Wallet} />
          <StatTile
            label="Margen vs. PVP"
            value={`${diffPositive ? '+' : ''}${formatMoney(d?.diff ?? 0)}`}
            icon={TrendingUp}
            tone={diffPositive ? 'ok' : 'destructive'}
          />
        </div>
      )}
    </div>
  );
}

type DashboardTab = 'sales' | 'inventory' | 'checklist';

function AdminDashboard() {
  const [tab, setTab] = useState<DashboardTab>('sales');
  const stats = useProductStats();
  const data = stats.data ?? [];

  const totalProducts = data.length;
  const units = data.reduce((s, p) => s + p.stock, 0);
  const warehouseValue = data.reduce((s, p) => s + p.stock * p.price, 0);
  // Bajo umbral según el min_stock de cada producto.
  const low = data.filter((p) => p.stock > 0 && p.stock <= p.min_stock).length;
  const out = data.filter((p) => p.stock <= 0).length;
  // Productos a reponer: en o por debajo de su umbral (incluye agotados), más urgentes primero.
  const toRestock = [...data]
    .filter((p) => p.stock <= p.min_stock)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <PageHeader title="Panel" subtitle="Inventario, ventas y revisiones de furgoneta." />

      <Segmented
        ariaLabel="Vista del panel"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'sales', label: 'Ventas' },
          { value: 'inventory', label: 'Inventario' },
          { value: 'checklist', label: 'Furgoneta' },
        ]}
      />

      {tab === 'sales' && (
        <div className="space-y-6">
          <PeriodSales />

          <section className="space-y-2.5">
            <SectionTitle icon={BarChart3}>Actividad (7 días)</SectionTitle>
            <Card className="p-4">
              <ActivityChart />
            </Card>
          </section>

          <section className="space-y-2.5">
            <SectionTitle icon={TrendingUp}>Top productos</SectionTitle>
            {stats.isLoading ? (
              <Card className="p-4">
                <Skeleton className="h-24 w-full" />
              </Card>
            ) : stats.isError ? (
              <LoadError onRetry={() => void stats.refetch()} />
            ) : (
              <TopProducts data={data} />
            )}
          </section>
        </div>
      )}

      {tab === 'inventory' && (
        <div className="space-y-6">
          {stats.isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-[5.25rem]" />
              <Skeleton className="h-[5.25rem]" />
              <Skeleton className="col-span-2 h-[5.25rem]" />
              <Skeleton className="h-[5.25rem]" />
              <Skeleton className="h-[5.25rem]" />
            </div>
          ) : stats.isError ? (
            <LoadError onRetry={() => void stats.refetch()} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatTile label="Productos" value={totalProducts} icon={Package} />
                <StatTile label="Unidades en stock" value={units} icon={Boxes} />
                <StatTile
                  label="Valor de almacén (a PVP)"
                  value={formatMoney(warehouseValue)}
                  icon={Wallet}
                  className="col-span-2"
                />
                <StatTile
                  label="Quedan pocos"
                  value={low}
                  icon={TriangleAlert}
                  tone={low > 0 ? 'destructive' : 'default'}
                />
                <StatTile
                  label="Agotados"
                  value={out}
                  icon={PackageX}
                  tone={out > 0 ? 'destructive' : 'default'}
                />
              </div>

              <section className="space-y-2.5">
                <SectionTitle icon={TriangleAlert}>Por reponer</SectionTitle>
                {toRestock.length > 0 ? (
                  <Card>
                    <ul className="divide-y divide-border px-4">
                      {toRestock.map((p) => (
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
                              <p className="truncate font-mono text-xs text-muted-foreground">
                                {p.code}
                              </p>
                            </div>
                            <StockBadge stock={p.stock} minStock={p.min_stock} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ) : (
                  <EmptyState
                    icon={Package}
                    title="Todo con stock suficiente"
                    description="Ningún producto está en o por debajo de su umbral."
                  />
                )}
              </section>
            </>
          )}
        </div>
      )}

      {tab === 'checklist' && (
        <section className="space-y-2.5">
          <SectionTitle icon={ClipboardCheck}>Revisiones de furgoneta</SectionTitle>
          <ChecklistReviews showAuthor />
        </section>
      )}
    </div>
  );
}

// El staff (repartidores) solo ve sus propias revisiones de furgoneta.
function StaffChecklistView() {
  return (
    <div className="space-y-5">
      <PageHeader title="Revisiones" subtitle="Tu historial de revisiones de furgoneta." />
      <ChecklistReviews />
    </div>
  );
}

export function DashboardPage() {
  const role = useRole();

  if (role.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Spinner /> Cargando…
      </div>
    );
  }

  return role.data === 'admin' ? <AdminDashboard /> : <StaffChecklistView />;
}
