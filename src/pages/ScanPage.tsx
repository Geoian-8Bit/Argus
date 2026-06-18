import { useCallback, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { QrScanner } from '@/features/scan/QrScanner';
import { useProductByCode } from '@/features/scan/useProductByCode';
import { useRegisterMovement } from '@/features/movements/useRegisterMovement';

type Action = 'in' | 'out';

const ACTION_LABELS: Record<Action, { verb: string; cta: string; tone: string }> = {
  in: { verb: 'Añadir', cta: 'Añadir al stock', tone: 'bg-primary text-primary-foreground' },
  out: {
    verb: 'Retirar',
    cta: 'Retirar del stock',
    tone: 'bg-destructive text-destructive-foreground',
  },
};

export function ScanPage() {
  const [searchParams] = useSearchParams();
  const rawAction = searchParams.get('action');
  const action: Action | null = rawAction === 'in' || rawAction === 'out' ? rawAction : null;

  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [qty, setQty] = useState<number>(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const productQuery = useProductByCode(scannedCode);
  const registerMovement = useRegisterMovement();

  const handleDecoded = useCallback((text: string) => {
    setScannedCode((prev) => (prev === text ? prev : text));
    setQty(1);
    setSuccessMessage(null);
  }, []);

  const resetScan = useCallback(() => {
    setScannedCode(null);
    setQty(1);
    registerMovement.reset();
  }, [registerMovement]);

  if (!action) {
    return <Navigate to="/" replace />;
  }

  const labels = ACTION_LABELS[action];
  const product = productQuery.data ?? null;
  const showScanner = scannedCode === null;

  async function handleConfirm() {
    if (!product || !action) return;
    try {
      await registerMovement.mutateAsync({
        productId: product.id,
        productCode: product.code,
        type: action,
        qty,
      });
      setSuccessMessage(
        `${action === 'in' ? '+' : '−'}${qty} en ${product.name}${product.variant ? ` (${product.variant})` : ''}`,
      );
      setScannedCode(null);
      setQty(1);
    } catch {
      // Error expuesto via registerMovement.error
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">{labels.verb}</h2>
          <p className="text-sm text-muted-foreground">Apunta la cámara al QR del producto.</p>
        </div>
        <Link to="/" className="text-xs text-muted-foreground underline-offset-2 hover:underline">
          Cambiar acción
        </Link>
      </header>

      {successMessage && (
        <p className="rounded-md border border-border bg-card px-3 py-2 text-sm">
          {successMessage}
        </p>
      )}

      {showScanner ? (
        <QrScanner onDecoded={handleDecoded} />
      ) : productQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Buscando producto…</p>
      ) : product ? (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          <div>
            <h3 className="text-base font-medium">{product.name}</h3>
            <p className="text-xs text-muted-foreground">
              {product.code}
              {product.variant ? ` · ${product.variant}` : ''}
            </p>
            <p className="mt-1 text-sm">
              Stock actual: <strong>{product.stock}</strong>
            </p>
          </div>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">Cantidad</span>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          {registerMovement.isError && (
            <p className="text-sm text-destructive">{registerMovement.error.message}</p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={resetScan}
              disabled={registerMovement.isPending}
              className="rounded-md border border-input py-2 text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={registerMovement.isPending}
              className={`rounded-md py-2 ${labels.tone} disabled:opacity-50`}
            >
              {registerMovement.isPending ? 'Guardando…' : labels.cta}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          <h3 className="text-base font-medium">Código no encontrado</h3>
          <p className="text-sm text-muted-foreground">
            El QR <span className="font-mono">{scannedCode}</span> no está dado de alta en el
            inventario.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={resetScan}
              className="rounded-md border border-input py-2 text-sm"
            >
              Reescanear
            </button>
            <Link
              to={`/products/new?code=${encodeURIComponent(scannedCode ?? '')}`}
              className="rounded-md bg-primary py-2 text-center text-sm text-primary-foreground"
            >
              Dar de alta
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
