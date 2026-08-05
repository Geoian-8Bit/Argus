import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Package,
  PackagePlus,
  Plus,
  SearchX,
  ChevronDown,
  QrCode,
  FolderPlus,
  Pencil,
  Archive,
  RotateCcw,
  PowerOff,
} from 'lucide-react';
import { useProducts, type Product } from '@/features/products/useProducts';
import { useRestoreProduct } from '@/features/products/useRestoreProduct';
import { useSetProductStock } from '@/features/products/useSetProductStock';
import { useProductGroups, type ProductGroup } from '@/features/products/useProductGroups';
import { GroupModal } from '@/features/products/GroupModal';
import { SortableProductList } from '@/features/products/SortableProductList';
import {
  loadProductsListState,
  saveProductsListState,
  type ProductsView,
} from '@/features/products/productsListState';
import { downloadProductsQrPdf } from '@/features/products/downloadProductsQr';
import { QrSelectModal } from '@/features/products/QrSelectModal';
import type { QrPdfProgress } from '@/lib/qrPdf';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  PageHeader,
  Button,
  ButtonLink,
  Input,
  Card,
  EmptyState,
  Skeleton,
  Segmented,
  type SegmentedOption,
  ProgressModal,
} from '@/components/ui';

/** Clave del pseudogrupo que agrupa los productos sin grupo asignado. */
const UNGROUPED = 'ungrouped';

const VIEWS: SegmentedOption<ProductsView>[] = [
  { value: 'groups', label: 'Grupos' },
  { value: 'products', label: 'Productos' },
];

interface GroupSection {
  key: string;
  name: string;
  /** Grupo real (ausente en "Sin grupo"), para poder editarlo. */
  group?: ProductGroup;
  products: Product[];
}

function ArchivedRow({
  product,
  onRestore,
  restoring,
}: {
  product: Product;
  onRestore: (id: string) => void;
  restoring: boolean;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Link
        to={`/products/${product.id}`}
        className="min-w-0 flex-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <p className="flex items-center gap-2 truncate text-sm font-medium text-muted-foreground">
          <span className="truncate">
            {product.name}
            {product.variant ? <span> · {product.variant}</span> : null}
          </span>
          <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Archivado
          </span>
        </p>
        <p className="truncate font-mono text-xs text-muted-foreground">{product.code}</p>
      </Link>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-auto shrink-0"
        loading={restoring}
        onClick={() => onRestore(product.id)}
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Reactivar
      </Button>
    </li>
  );
}

function InactiveRow({
  product,
  onReactivate,
  reactivating,
}: {
  product: Product;
  onReactivate: (id: string) => void;
  reactivating: boolean;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Link
        to={`/products/${product.id}`}
        className="min-w-0 flex-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <p className="flex items-center gap-2 truncate text-sm font-medium text-muted-foreground">
          <span className="truncate">
            {product.name}
            {product.variant ? <span> · {product.variant}</span> : null}
          </span>
          <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            No se usa
          </span>
        </p>
        <p className="truncate font-mono text-xs text-muted-foreground">{product.code}</p>
      </Link>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-auto shrink-0"
        loading={reactivating}
        onClick={() => onReactivate(product.id)}
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Reactivar
      </Button>
    </li>
  );
}

export function ProductsPage() {
  // Estado persistido (vista, búsqueda, scroll) para que al volver del detalle
  // el listado quede como estaba. Los grupos siempre empiezan cerrados.
  const initialState = useRef(loadProductsListState()).current;
  const [view, setView] = useState<ProductsView>(initialState.view);
  const [search, setSearch] = useState(initialState.search);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const debounced = useDebouncedValue(search, 250);
  const products = useProducts(debounced);
  const groupsQuery = useProductGroups();
  const restoreProduct = useRestoreProduct();
  const setProductStock = useSetProductStock();
  const isSearching = debounced.trim().length > 0;

  // undefined = cerrado, null = crear grupo, objeto = editar ese grupo.
  const [groupModal, setGroupModal] = useState<ProductGroup | null | undefined>(undefined);

  // Desplegable del botón "Nuevo" (Producto / Grupo).
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  useEffect(() => {
    if (!newMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNewMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [newMenuOpen]);

  const [selectOpen, setSelectOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressInfo, setProgressInfo] = useState<QrPdfProgress | null>(null);

  const stateRef = useRef({ view, search });
  stateRef.current = { view, search };
  useEffect(
    () => () => {
      saveProductsListState({
        view: stateRef.current.view,
        search: stateRef.current.search,
        scrollY: window.scrollY,
      });
    },
    [],
  );

  const isLoading = products.isLoading || groupsQuery.isLoading;
  const isError = products.isError || groupsQuery.isError;
  const loadError = products.error ?? groupsQuery.error;

  // Restaura el scroll cuando el listado ya está pintado con datos.
  const scrollRestored = useRef(false);
  useLayoutEffect(() => {
    if (scrollRestored.current || isLoading) return;
    scrollRestored.current = true;
    if (initialState.scrollY > 0) window.scrollTo(0, initialState.scrollY);
  }, [isLoading, initialState.scrollY]);

  async function handleExportSelected(codes: string[]) {
    if (exporting) return;
    setSelectOpen(false);
    setExportError(null);
    setProgress(0);
    setProgressInfo(null);
    setExporting(true);
    try {
      await downloadProductsQrPdf(codes, (p) => {
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

  // Los archivados y desactivados solo llegan al buscar; se muestran aparte y
  // no cuentan en los totales de stock/valor.
  const rawList = useMemo(() => products.data ?? [], [products.data]);
  const list = useMemo(
    () => rawList.filter((p) => !p.archived_at && p.stock !== -1),
    [rawList],
  );
  const archivedList = useMemo(() => rawList.filter((p) => p.archived_at), [rawList]);
  const inactiveList = useMemo(
    () => rawList.filter((p) => !p.archived_at && p.stock === -1),
    [rawList],
  );
  const totalUnits = list.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = list.reduce((sum, p) => sum + p.stock * p.price, 0);

  const sections = useMemo<GroupSection[]>(() => {
    const byGroup = new Map<string, Product[]>();
    for (const p of list) {
      const key = p.group_id ?? UNGROUPED;
      const bucket = byGroup.get(key);
      if (bucket) bucket.push(p);
      else byGroup.set(key, [p]);
    }
    const groups = groupsQuery.data ?? [];
    const known = new Set(groups.map((g) => g.id));
    // Sin búsqueda se muestran también los grupos vacíos (para poder editarlos);
    // buscando, solo los grupos con resultados.
    const result: GroupSection[] = groups
      .filter((g) => (isSearching ? byGroup.has(g.id) : true))
      .map((g) => ({ key: g.id, name: g.name, group: g, products: byGroup.get(g.id) ?? [] }));
    // Los productos sin grupo (o con un grupo ya inexistente) van al final.
    const ungrouped = [...(byGroup.get(UNGROUPED) ?? [])];
    for (const [key, prods] of byGroup) {
      if (key !== UNGROUPED && !known.has(key)) ungrouped.push(...prods);
    }
    if (ungrouped.length > 0) {
      result.push({ key: UNGROUPED, name: 'Sin grupo', products: ungrouped });
    }
    return result;
  }, [list, groupsQuery.data, isSearching]);

  function toggleGroup(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const hasActive = view === 'groups' ? sections.length > 0 : list.length > 0;
  const hasContent = hasActive || archivedList.length > 0 || inactiveList.length > 0;

  function handleRestore(productId: string) {
    restoreProduct.mutate(productId);
  }

  function handleReactivate(productId: string) {
    // Reactivar desde el listado deja el stock en 0; se añade cantidad real
    // después con "Ajustar stock" en la ficha del producto.
    setProductStock.mutate({ id: productId, stock: 0 });
  }

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
              onClick={() => setSelectOpen(true)}
              loading={exporting}
              title="Descargar un PDF con el QR de los productos que selecciones"
            >
              <QrCode className="h-4 w-4" aria-hidden="true" />
              QR PDF
            </Button>
            <div className="relative">
              <Button
                type="button"
                size="sm"
                className="w-auto"
                onClick={() => setNewMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={newMenuOpen}
              >
                <Plus
                  className={cn(
                    'h-4 w-4 transition-transform duration-200 ease-out',
                    newMenuOpen && 'rotate-45',
                  )}
                  aria-hidden="true"
                />
                Nuevo
              </Button>

              {newMenuOpen && (
                <>
                  {/* Capa invisible para cerrar el menú al tocar fuera. */}
                  <div className="fixed inset-0 z-30" onClick={() => setNewMenuOpen(false)} />
                  <div
                    role="menu"
                    aria-label="Crear nuevo"
                    className="absolute right-0 top-full z-40 mt-2 w-44 origin-top-right animate-dropdown-in overflow-hidden rounded-lg border border-border bg-card shadow-lg"
                  >
                    <Link
                      to="/products/new"
                      role="menuitem"
                      onClick={() => setNewMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      Producto
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setNewMenuOpen(false);
                        setGroupModal(null);
                      }}
                      className="flex w-full items-center gap-2.5 border-t border-border px-3.5 py-2.5 text-left text-sm font-medium transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <FolderPlus className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      Grupo
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        }
      />

      {exportError && (
        <p className="text-sm text-destructive" role="alert">
          {exportError}
        </p>
      )}

      {restoreProduct.isError && (
        <p className="text-sm text-destructive" role="alert">
          No se pudo reactivar el producto: {restoreProduct.error.message}
        </p>
      )}

      {setProductStock.isError && (
        <p className="text-sm text-destructive" role="alert">
          No se pudo reactivar el producto: {setProductStock.error.message}
        </p>
      )}

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
            placeholder="Buscar por nombre o código"
            aria-label="Buscar productos"
            className="pl-9"
          />
        </div>

        <Segmented value={view} onChange={setView} options={VIEWS} ariaLabel="Tipo de vista" />
      </div>

      {isLoading ? (
        <Card className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      ) : isError ? (
        <EmptyState
          icon={SearchX}
          title="No se pudo cargar"
          description={loadError instanceof Error ? loadError.message : 'Inténtalo de nuevo.'}
        />
      ) : hasContent ? (
        <div className="space-y-3">
          {hasActive && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm">
              <span className="text-muted-foreground">
                {list.length} {list.length === 1 ? 'producto' : 'productos'} ·{' '}
                <span className="tabular-nums text-foreground">{totalUnits}</span> uds
              </span>
              <span className="font-semibold tabular-nums" title="Valor del stock a precio base">
                {formatMoney(totalValue)}
              </span>
            </div>
          )}

          {!hasActive ? null : view === 'products' ? (
            <Card>
              <SortableProductList products={list} reorderable={!isSearching} />
            </Card>
          ) : (
            sections.map((section) => {
              // Durante una búsqueda se muestran abiertos todos los grupos con resultados.
              const isOpen = isSearching || expanded.has(section.key);
              const units = section.products.reduce((sum, p) => sum + p.stock, 0);
              const value = section.products.reduce((sum, p) => sum + p.stock * p.price, 0);
              return (
                <Card key={section.key}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => {
                      if (!isSearching) toggleGroup(section.key);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{section.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {section.products.length}{' '}
                        {section.products.length === 1 ? 'producto' : 'productos'} ·{' '}
                        <span className="tabular-nums">{units}</span> uds
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                      {formatMoney(value)}
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out',
                        isOpen && 'rotate-180',
                      )}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-border">
                      {section.products.length === 0 && (
                        <p className="px-4 py-3 text-sm text-muted-foreground">
                          Este grupo no tiene productos.
                        </p>
                      )}
                      <SortableProductList
                        products={section.products}
                        reorderable={!isSearching}
                      />
                      {section.group && (
                        <button
                          type="button"
                          onClick={() => setGroupModal(section.group)}
                          className={cn(
                            'flex w-full items-center justify-center gap-1.5 rounded-b-lg px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                            section.products.length > 0 && 'border-t border-border',
                          )}
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          Editar grupo
                        </button>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          )}

          {inactiveList.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 rounded-t-lg border-b border-border bg-muted/40 px-4 py-3">
                <PowerOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-semibold text-muted-foreground">
                  No se usan <span className="tabular-nums">({inactiveList.length})</span>
                </p>
              </div>
              <ul className="divide-y divide-border">
                {inactiveList.map((p) => (
                  <InactiveRow
                    key={p.id}
                    product={p}
                    onReactivate={handleReactivate}
                    reactivating={setProductStock.isPending && setProductStock.variables?.id === p.id}
                  />
                ))}
              </ul>
            </Card>
          )}

          {archivedList.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 rounded-t-lg border-b border-border bg-muted/40 px-4 py-3">
                <Archive className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-semibold text-muted-foreground">
                  Archivados <span className="tabular-nums">({archivedList.length})</span>
                </p>
              </div>
              <ul className="divide-y divide-border">
                {archivedList.map((p) => (
                  <ArchivedRow
                    key={p.id}
                    product={p}
                    onRestore={handleRestore}
                    restoring={restoreProduct.isPending && restoreProduct.variables === p.id}
                  />
                ))}
              </ul>
            </Card>
          )}
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

      {selectOpen && (
        <QrSelectModal onClose={() => setSelectOpen(false)} onConfirm={handleExportSelected} />
      )}

      {groupModal !== undefined && (
        <GroupModal group={groupModal} onClose={() => setGroupModal(undefined)} />
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
