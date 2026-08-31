import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TriangleAlert, X, PackageX, SearchX } from 'lucide-react';
import { useAlertProducts } from './useAlertProducts';
import { Spinner, StockBadge } from '@/components/ui';

interface AlertProductsModalProps {
  onClose: () => void;
  /**
   * La ficha de producto es solo de admin: para los demás roles las filas se
   * pintan sin enlace (si no, el enlace acabaría en una redirección).
   */
  linkToDetail?: boolean;
}

/**
 * Modal que lista, uno a uno, los productos sin stock o por debajo de su
 * umbral (los mismos que cuenta la tarjeta "Quedan pocos" de Inicio).
 */
export function AlertProductsModal({ onClose, linkToDetail = true }: AlertProductsModalProps) {
  const alerts = useAlertProducts();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const list = useMemo(() => alerts.data ?? [], [alerts.data]);
  const out = useMemo(() => list.filter((p) => p.is_out), [list]);
  const low = useMemo(() => list.filter((p) => p.is_low), [list]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Productos sin stock o con stock bajo"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      <div
        className="absolute inset-0 animate-fade-in bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex max-h-[85vh] w-full max-w-md animate-modal-in flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-lg sm:max-h-[80vh] sm:rounded-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <TriangleAlert className="h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-semibold leading-tight">
              Sin stock o quedan pocos
            </h2>
            <p className="text-xs text-muted-foreground">
              {list.length} {list.length === 1 ? 'producto necesita' : 'productos necesitan'}{' '}
              reposición.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {alerts.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Spinner /> Cargando…
            </div>
          ) : alerts.isError ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center text-sm text-muted-foreground">
              <SearchX className="h-6 w-6" aria-hidden="true" />
              {alerts.error instanceof Error ? alerts.error.message : 'No se pudo cargar.'}
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center text-sm text-muted-foreground">
              <PackageX className="h-6 w-6" aria-hidden="true" />
              Ningún producto está sin stock ni por debajo de su umbral.
            </div>
          ) : (
            <>
              {out.length > 0 && (
                <AlertGroup
                  title="Sin stock"
                  products={out}
                  onNavigate={onClose}
                  linkToDetail={linkToDetail}
                />
              )}
              {low.length > 0 && (
                <AlertGroup
                  title="Quedan pocos"
                  products={low}
                  onNavigate={onClose}
                  linkToDetail={linkToDetail}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AlertGroup({
  title,
  products,
  onNavigate,
  linkToDetail,
}: {
  title: string;
  products: ReturnType<typeof useAlertProducts>['data'];
  onNavigate: () => void;
  linkToDetail: boolean;
}) {
  return (
    <div>
      <p className="sticky top-0 bg-card px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title} <span className="tabular-nums">({(products ?? []).length})</span>
      </p>
      <ul className="divide-y divide-border border-t border-border">
        {(products ?? []).map((p) => {
          const row = (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {p.name}
                  {p.variant ? <span className="text-muted-foreground"> · {p.variant}</span> : null}
                </p>
                <p className="truncate font-mono text-xs text-muted-foreground">{p.code}</p>
              </div>
              <StockBadge stock={p.stock ?? 0} minStock={p.min_stock ?? undefined} />
            </>
          );
          return (
            <li key={p.id}>
              {linkToDetail ? (
                <Link
                  to={`/products/${p.id}`}
                  onClick={onNavigate}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  {row}
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">{row}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
