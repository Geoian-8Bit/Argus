import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, PackagePlus, Plus, SearchX, ChevronRight, QrCode } from 'lucide-react';
import { useProducts } from '@/features/products/useProducts';
import { downloadAllProductsQrPdf } from '@/features/products/downloadProductsQr';
import type { QrPdfProgress } from '@/lib/qrPdf';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { formatMoney } from '@/lib/format';
import {
  PageHeader,
  Button,
  ButtonLink,
  Input,
  Card,
  StockBadge,
  EmptyState,
  Skeleton,
  ProgressModal,
} from '@/components/ui';

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 250);
  const products = useProducts(debounced);
  const isSearching = debounced.trim().length > 0;

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressInfo, setProgressInfo] = useState<QrPdfProgress | null>(null);

  async function handleDownloadQr() {
    if (exporting) return;
    setExportError(null);
    setProgress(0);
    setProgressInfo(null);
    setExporting(true);
    try {
      await downloadAllProductsQrPdf((p) => {
        setProgress(p.ratio);
        setProgressInfo(p);
      });
      setProgress(1);
      // Deja ver el 100% un instante antes de cerrar el modal.
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : 'No se pudo generar el PDF de códigos QR.',
      );
    } finally {
      setExporting(false);
    }
  }

  const progressMessage =
    progress >= 1
      ? '¡Listo! Descargando el PDF…'
      : progressInfo?.phase === 'compose'
        ? 'Componiendo el PDF…'
        : progressInfo
          ? `Generando códigos QR… ${progressInfo.done}/${progressInfo.total}`
          : 'Preparando…';

  const list = products.data ?? [];
  const totalUnits = list.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = list.reduce((sum, p) => sum + p.stock * p.price, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Productos"
        subtitle="Da de alta productos para generar su QR y escanearlos."
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-auto"
              onClick={handleDownloadQr}
              loading={exporting}
              title="Descargar un PDF con el QR de todos los productos activos"
            >
              <QrCode className="h-4 w-4" aria-hidden="true" />
              QR PDF
            </Button>
            <ButtonLink to="/products/new" size="sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nuevo
            </ButtonLink>
          </div>
        }
      />

      {exportError && (
        <p className="text-sm text-destructive" role="alert">
          {exportError}
        </p>
      )}

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
          placeholder="Buscar por nombre o código"
          aria-label="Buscar productos"
          className="pl-9"
        />
      </div>

      {products.isLoading ? (
        <Card className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      ) : products.isError ? (
        <EmptyState
          icon={SearchX}
          title="No se pudo cargar"
          description={
            products.error instanceof Error ? products.error.message : 'Inténtalo de nuevo.'
          }
        />
      ) : list.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">
              {list.length} {list.length === 1 ? 'producto' : 'productos'} ·{' '}
              <span className="tabular-nums text-foreground">{totalUnits}</span> uds
            </span>
            <span className="font-semibold tabular-nums" title="Valor del stock a precio base">
              {formatMoney(totalValue)}
            </span>
          </div>

          <Card>
            <ul className="divide-y divide-border">
              {list.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/products/${p.id}`}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
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
                    <div className="flex flex-col items-end gap-0.5">
                      <StockBadge stock={p.stock} minStock={p.min_stock} />
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {formatMoney(p.stock * p.price)}
                      </span>
                    </div>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : isSearching ? (
        <EmptyState
          icon={SearchX}
          title="Sin resultados"
          description={`No hay productos que coincidan con "${debounced}".`}
        />
      ) : (
        <EmptyState
          icon={Package}
          title="Aún no hay productos"
          description="Crea tu primer producto para generar su QR."
          action={
            <ButtonLink to="/products/new" size="md">
              <PackagePlus className="h-4 w-4" aria-hidden="true" />
              Nuevo producto
            </ButtonLink>
          }
        />
      )}

      <ProgressModal
        open={exporting}
        title="Generando PDF de códigos QR"
        message={progressMessage}
        progress={progress}
      />
    </div>
  );
}
