import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useCreateProduct, type Product } from '@/features/products/useCreateProduct';
import { QrPreview } from '@/features/products/QrPreview';
import { PageHeader, Button, ButtonLink, Field, Input, Textarea } from '@/components/ui';

export function ProductNewPage() {
  const [searchParams] = useSearchParams();
  const prefilledCode = searchParams.get('code') ?? '';

  const [code, setCode] = useState(prefilledCode);
  const [name, setName] = useState('');
  const [variant, setVariant] = useState('');
  const [notes, setNotes] = useState('');
  const [initialStock, setInitialStock] = useState<string>('0');
  const [created, setCreated] = useState<Product | null>(null);

  const createProduct = useCreateProduct();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const stockNum = Math.max(0, Math.trunc(Number(initialStock)) || 0);
    try {
      const product = await createProduct.mutateAsync({
        code,
        name,
        variant,
        notes,
        initialStock: stockNum,
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
    setInitialStock('0');
    createProduct.reset();
  }

  if (created) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ok/15 text-ok">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold tracking-tight">Producto creado</h2>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{created.name}</strong>
              {created.variant ? ` · ${created.variant}` : ''} · stock {created.stock}
            </p>
          </div>
        </div>

        <QrPreview value={created.code} label={created.name} />

        <div className="grid grid-cols-2 gap-2 print:hidden">
          <Button onClick={handleNew}>Otro producto</Button>
          <ButtonLink to="/products" variant="outline">
            Ver listado
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Nuevo producto"
        subtitle="Al guardar se generará su QR para imprimir o descargar."
      />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Código" hint="Legible por humanos, p. ej. ALM-A-60" required>
          <Input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ALM-A-60"
            disabled={createProduct.isPending}
            autoCapitalize="characters"
          />
        </Field>

        <Field label="Nombre" required>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Almohada tipo A 60cm"
            disabled={createProduct.isPending}
          />
        </Field>

        <Field label="Variante" hint="Opcional">
          <Input
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            placeholder="A / B / C…"
            disabled={createProduct.isPending}
          />
        </Field>

        <Field label="Stock inicial">
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            value={initialStock}
            onChange={(e) => setInitialStock(e.target.value)}
            disabled={createProduct.isPending}
          />
        </Field>

        <Field label="Notas" hint="Opcional">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            disabled={createProduct.isPending}
          />
        </Field>

        {createProduct.isError && (
          <p className="text-sm text-destructive" role="alert">
            {createProduct.error.message}
          </p>
        )}

        <Button type="submit" loading={createProduct.isPending}>
          Guardar y generar QR
        </Button>
      </form>
    </div>
  );
}
