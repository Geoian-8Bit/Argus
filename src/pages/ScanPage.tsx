import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  PackageX,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { QrScanner } from '@/features/scan/QrScanner';
import { useProductByCode } from '@/features/scan/useProductByCode';
import { useRegisterMovement } from '@/features/movements/useRegisterMovement';
import {
  PageHeader,
  Card,
  Button,
  ButtonLink,
  Field,
  Input,
  StockBadge,
  Spinner,
} from '@/components/ui';
import { formatMoney } from '@/lib/format';

type Action = 'in' | 'out';

const ACTION = {
  in: { verb: 'Añadir', cta: 'Añadir al stock', variant: 'primary', Icon: ArrowDownToLine },
  out: { verb: 'Retirar', cta: 'Retirar del stock', variant: 'destructive', Icon: ArrowUpFromLine },
} as const;

export function ScanPage() {
  const [searchParams] = useSearchParams();
  const rawAction = searchParams.get('action');
  const action: Action | null = rawAction === 'in' || rawAction === 'out' ? rawAction : null;

  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [qty, setQty] = useState<string>('1');
  const [salePrice, setSalePrice] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const productQuery = useProductByCode(scannedCode);
  const registerMovement = useRegisterMovement();

  const handleDecoded = useCallback((text: string) => {
    setScannedCode((prev) => (prev === text ? prev : text));
    setQty('1');
    setSuccessMessage(null);
  }, []);

  const resetScan = useCallback(() => {
    setScannedCode(null);
    setQty('1');
    setSalePrice('');
    registerMovement.reset();
  }, [registerMovement]);

  const product = productQuery.data ?? null;

  // Al cargar el producto en una salida, precargamos el precio de venta con el
  // precio base; el usuario puede modificarlo antes de confirmar.
  useEffect(() => {
    if (product && action === 'out') {
      setSalePrice(String(Number(product.price) || 0));
    }
  }, [product?.id, action]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!action) {
    return <Navigate to="/" replace />;
  }

  const labels = ACTION[action];
  const showScanner = scannedCode === null;
  const qtyNum = Math.trunc(Number(qty));
  const qtyValid = Number.isFinite(qtyNum) && qtyNum >= 1;
  const isSale = action === 'out';
  const priceNum = Number(salePrice);
  const priceValid = Number.isFinite(priceNum) && priceNum >= 0 && salePrice.trim() !== '';
  const canConfirm = qtyValid && (!isSale || priceValid);

  async function handleConfirm() {
    if (!product || !action || !canConfirm) return;
    try {
      await registerMovement.mutateAsync({
        productId: product.id,
        productCode: product.code,
        type: action,
        qty: qtyNum,
        unitPrice: isSale ? priceNum : null,
      });
      const base = `${isSale ? '−' : '+'}${qtyNum} · ${product.name}${product.variant ? ` (${product.variant})` : ''}`;
      setSuccessMessage(isSale ? `${base} · ${formatMoney(priceNum * qtyNum)}` : base);
      setScannedCode(null);
      setQty('1');
      setSalePrice('');
    } catch {
      // El error se muestra vía registerMovement.error
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={labels.verb}
        subtitle="Apunta la cámara al QR del producto."
        action={
          <Link
            to="/"
            className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Cambiar acción
          </Link>
        }
      />

      {successMessage && (
        <div className="flex items-center gap-2 rounded-md border border-ok/40 bg-ok/10 px-3 py-2.5 text-sm font-medium text-ok">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Movimiento registrado: {successMessage}</span>
        </div>
      )}

      {showScanner ? (
        <QrScanner onDecoded={handleDecoded} />
      ) : productQuery.isLoading ? (
        <Card className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
          <Spinner /> Buscando producto…
        </Card>
      ) : product ? (
        <Card className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-base font-semibold">{product.name}</h3>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {product.code}
                {product.variant ? ` · ${product.variant}` : ''}
              </p>
            </div>
            <StockBadge stock={product.stock} />
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

          {isSale && (
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

          {registerMovement.isError && (
            <p className="text-sm text-destructive" role="alert">
              {registerMovement.error.message}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={resetScan} disabled={registerMovement.isPending}>
              Cancelar
            </Button>
            <Button
              variant={labels.variant}
              onClick={handleConfirm}
              loading={registerMovement.isPending}
              disabled={!canConfirm}
            >
              {!registerMovement.isPending && (
                <labels.Icon className="h-4 w-4" aria-hidden="true" />
              )}
              {labels.cta}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="space-y-4 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <PackageX className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-base font-semibold">Código no encontrado</h3>
              <p className="text-sm text-muted-foreground">
                El QR <span className="font-mono">{scannedCode}</span> no está dado de alta.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={resetScan}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reescanear
            </Button>
            <ButtonLink to={`/products/new?code=${encodeURIComponent(scannedCode ?? '')}`}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Dar de alta
            </ButtonLink>
          </div>
        </Card>
      )}
    </div>
  );
}
