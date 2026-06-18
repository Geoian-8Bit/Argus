import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCreateProduct, type Product } from '@/features/products/useCreateProduct';
import { QrPreview } from '@/features/products/QrPreview';

export function ProductNewPage() {
  const [searchParams] = useSearchParams();
  const prefilledCode = searchParams.get('code') ?? '';

  const [code, setCode] = useState(prefilledCode);
  const [name, setName] = useState('');
  const [variant, setVariant] = useState('');
  const [notes, setNotes] = useState('');
  const [initialStock, setInitialStock] = useState<number>(0);
  const [created, setCreated] = useState<Product | null>(null);

  const createProduct = useCreateProduct();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const product = await createProduct.mutateAsync({
        code,
        name,
        variant,
        notes,
        initialStock,
      });
      setCreated(product);
    } catch {
      // El error queda expuesto via createProduct.error
    }
  }

  function handleNew() {
    setCreated(null);
    setCode('');
    setName('');
    setVariant('');
    setNotes('');
    setInitialStock(0);
    createProduct.reset();
  }

  if (created) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <header>
          <h2 className="text-base font-semibold">Producto creado</h2>
          <p className="text-sm text-muted-foreground">
            <strong>{created.name}</strong>
            {created.variant ? ` · ${created.variant}` : ''} · stock {created.stock}
          </p>
        </header>

        <QrPreview value={created.code} label={created.name} />

        <div className="grid grid-cols-2 gap-2 print:hidden">
          <button
            type="button"
            onClick={handleNew}
            className="rounded-md bg-primary py-2 text-primary-foreground"
          >
            Otro producto
          </button>
          <Link to="/products" className="rounded-md border border-input py-2 text-center text-sm">
            Ver listado
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <header className="mb-4">
        <h2 className="text-base font-semibold">Nuevo producto</h2>
        <p className="text-sm text-muted-foreground">
          Crea un producto en el inventario. Al guardar se generará su QR para imprimir o descargar.
        </p>
      </header>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">
            Código <span className="text-muted-foreground">(legible humano)</span>
          </span>
          <input
            required
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="ej. ALM-A-60"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
            disabled={createProduct.isPending}
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">Nombre</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Almohada tipo A 60cm"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
            disabled={createProduct.isPending}
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">
            Variante <span className="text-muted-foreground">(opcional)</span>
          </span>
          <input
            value={variant}
            onChange={(event) => setVariant(event.target.value)}
            placeholder="A / B / C…"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
            disabled={createProduct.isPending}
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">Stock inicial</span>
          <input
            type="number"
            min={0}
            value={initialStock}
            onChange={(event) => setInitialStock(Math.max(0, Number(event.target.value) || 0))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
            disabled={createProduct.isPending}
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">
            Notas <span className="text-muted-foreground">(opcional)</span>
          </span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
            disabled={createProduct.isPending}
          />
        </label>

        {createProduct.isError && (
          <p className="text-sm text-destructive">{createProduct.error.message}</p>
        )}

        <button
          type="submit"
          disabled={createProduct.isPending}
          className="w-full rounded-md bg-primary py-2 text-primary-foreground disabled:opacity-50"
        >
          {createProduct.isPending ? 'Guardando…' : 'Guardar y generar QR'}
        </button>
      </form>
    </div>
  );
}
