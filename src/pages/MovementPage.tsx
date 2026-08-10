import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDownToLine, ArrowUpFromLine, CheckCircle2, PackageX, Search } from 'lucide-react';
import { useProducts, type Product } from '@/features/products/useProducts';
import { useRegisterMovement } from '@/features/movements/useRegisterMovement';
import { INACTIVE_STOCK } from '@/features/products/constants';
import { useRole } from '@/features/auth/useRole';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import {
  PageHeader,
  Card,
  Button,
  Field,
  Input,
  Textarea,
  Segmented,
  StockBadge,
  EmptyState,
  Skeleton,
} from '@/components/ui';
import { formatMoney } from '@/lib/format';

type Action = 'in' | 'out';

const ACTIONS = [
  { value: 'out' as const, label: 'Salida' },
  { value: 'in' as const, label: 'Entrada' },
];

/**
 * Registro de movimientos sin escanear: se elige el producto de una lista.
 * Es la vía de los comerciales, que trabajan sin QR y anotan a qué cliente va
 * cada salida.
 */
export function MovementPage() {
  // La acción puede venir de las tarjetas de Inicio (?action=in|out).
  const [searchParams] = useSearchParams();
  const initialAction: Action = searchParams.get('action') === 'in' ? 'in' : 'out';
  const [action, setAction] = useState<Action>(initialAction);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [qty, setQty] = useState('1');
  const [customer, setCustomer] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [note, setNote] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 250);
  const products = useProducts(debouncedSearch);
  const registerMovement = useRegisterMovement();
  const role = useRole();
  // El staff no maneja precios; admin y comercial sí (la venta es suya).
  const showPriceField = action === 'out' && role.data !== 'staff';

  // Al elegir producto para una salida se precarga el precio base, que se puede
  // cambiar antes de confirmar (cada comercial vende a su precio).
  useEffect(() => {
    if (selected && action === 'out') {
      setSalePrice(String(Number(selected.price) || 0));
    }
  }, [selected, action]);

  const qtyNum = Math.trunc(Number(qty));
  const qtyValid = Number.isFinite(qtyNum) && qtyNum >= 1;
  const priceNum = Number(salePrice);
  const priceValid = Number.isFinite(priceNum) && priceNum >= 0 && salePrice.trim() !== '';
  const isInactive = selected?.stock === INACTIVE_STOCK;
  const canConfirm = !!selected && !isInactive && qtyValid && (!showPriceField || priceValid);

  // Los desactivados y los archivados no admiten movimientos: no se ofrecen.
  const selectable = (products.data ?? []).filter(
    (p) => !p.archived_at && p.stock !== INACTIVE_STOCK,
  );

  function reset() {
    setSelected(null);
    setQty('1');
    setCustomer('');
    setSalePrice('');
    setNote('');
    registerMovement.reset();
  }

  async function handleConfirm() {
    if (!selected || !canConfirm) return;
    const isSale = action === 'out';
    const unitPrice = showPriceField ? priceNum : Number(selected.price) || 0;
    try {
      await registerMovement.mutateAsync({
        productId: selected.id,
        productCode: selected.code,
        type: action,
        qty: qtyNum,
        customer: isSale ? customer : null,
        note: note.trim() || null,
        unitPrice: isSale ? unitPrice : null,
      });
      const base = `${isSale ? '−' : '+'}${qtyNum} · ${selected.name}`;
      setSuccessMessage(isSale ? `${base} · ${formatMoney(unitPrice * qtyNum)}` : base);
      setSearch('');
      reset();
    } catch {
      // El error se muestra vía registerMovement.error
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Registrar movimiento"
        subtitle="Sin escanear: elige el producto y anota."
      />

      {successMessage && (
        <div className="flex items-center gap-2 rounded-md border border-ok/40 bg-ok/10 px-3 py-2.5 text-sm font-medium text-ok">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Movimiento registrado: {successMessage}</span>
        </div>
      )}

      <Segmented
        ariaLabel="Tipo de movimiento"
        value={action}
        onChange={(next) => {
          setAction(next);
          setSuccessMessage(null);
        }}
        options={ACTIONS}
      />

      {selected ? (
        <Card className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-base font-semibold">{selected.name}</h3>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {selected.code}
                {selected.variant ? ` · ${selected.variant}` : ''}
              </p>
            </div>
            <StockBadge stock={selected.stock} minStock={selected.min_stock} />
          </div>

          <Field label="Cantidad">
            <Input
              type="number"
              min={1}
              inputMode="numeric"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </Field>

          {action === 'out' && (
            <Field label="Cliente" hint="A quién va la salida. Opcional.">
              <Input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Nombre del cliente"
              />
            </Field>
          )}

          {showPriceField && (
            <Field
              label="Precio de venta (€/ud)"
              hint={
                priceValid
                  ? `Total de la venta: ${formatMoney(priceNum * (qtyValid ? qtyNum : 0))}`
                  : 'Indica el precio real por unidad.'
              }
            >
              <Input
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="0,00"
              />
            </Field>
          )}

          <Field label="Comentario" hint="Opcional.">
            <Textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Cualquier detalle a recordar"
            />
          </Field>

          {registerMovement.isError && (
            <p className="text-sm text-destructive" role="alert">
              {registerMovement.error.message}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={reset} disabled={registerMovement.isPending}>
              Cambiar producto
            </Button>
            <Button
              variant={action === 'out' ? 'destructive' : 'primary'}
              onClick={handleConfirm}
              loading={registerMovement.isPending}
              disabled={!canConfirm}
            >
              {!registerMovement.isPending &&
                (action === 'out' ? (
                  <ArrowUpFromLine className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
                ))}
              {action === 'out' ? 'Registrar salida' : 'Registrar entrada'}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <Field label="Producto">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o código"
              />
            </div>
          </Field>

          {products.isLoading ? (
            <Card className="space-y-3 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ) : selectable.length > 0 ? (
            <Card>
              <ul className="divide-y divide-border px-4">
                {selectable.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(p);
                        setSuccessMessage(null);
                      }}
                      className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{p.name}</span>
                        <span className="block truncate font-mono text-xs text-muted-foreground">
                          {p.code}
                          {p.variant ? ` · ${p.variant}` : ''}
                        </span>
                      </span>
                      <StockBadge stock={p.stock} minStock={p.min_stock} />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <EmptyState
              icon={PackageX}
              title="Sin productos"
              description={
                search
                  ? 'Ningún producto de este almacén coincide con la búsqueda.'
                  : 'Este almacén todavía no tiene productos disponibles.'
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
