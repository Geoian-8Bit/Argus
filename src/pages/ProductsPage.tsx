import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, PackagePlus, Plus, SearchX, ChevronRight } from 'lucide-react';
import { useProducts } from '@/features/products/useProducts';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import {
  PageHeader,
  ButtonLink,
  Input,
  Card,
  StockBadge,
  EmptyState,
  Skeleton,
} from '@/components/ui';

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 250);
  const products = useProducts(debounced);
  const isSearching = debounced.trim().length > 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Productos"
        subtitle="Da de alta productos para generar su QR y escanearlos."
        action={
          <ButtonLink to="/products/new" size="sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo
          </ButtonLink>
        }
      />

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
      ) : products.data && products.data.length > 0 ? (
        <Card>
          <ul className="divide-y divide-border">
            {products.data.map((p) => (
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
                  <StockBadge stock={p.stock} />
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
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
    </div>
  );
}
