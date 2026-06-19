import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, PackageX, Trash2, CheckCircle2 } from 'lucide-react';
import { useProduct } from '@/features/products/useProduct';
import { useUpdateProduct } from '@/features/products/useUpdateProduct';
import { useArchiveProduct } from '@/features/products/useArchiveProduct';
import { QrPreview } from '@/features/products/QrPreview';
import {
  Card,
  Button,
  ButtonLink,
  Field,
  Input,
  Textarea,
  Spinner,
  EmptyState,
} from '@/components/ui';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const productQuery = useProduct(id);
  const updateProduct = useUpdateProduct();
  const archiveProduct = useArchiveProduct();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [variant, setVariant] = useState('');
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState('');
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const product = productQuery.data ?? null;

  useEffect(() => {
    if (product) {
      setCode(product.code);
      setName(product.name);
      setVariant(product.variant ?? '');
      setNotes(product.notes ?? '');
      setPrice(String(Number(product.price) || 0));
    }
  }, [product]);

  if (productQuery.isLoading) {
    return (
      <Card className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
        <Spinner /> Cargando producto…
      </Card>
    );
  }

  if (!product) {
    return (
      <EmptyState
        icon={PackageX}
        title="Producto no encontrado"
        description="No existe o ha sido eliminado."
        action={
          <ButtonLink to="/products" variant="outline">
            Volver a productos
          </ButtonLink>
        }
      />
    );
  }

  const dirty =
    code !== product.code ||
    name !== product.name ||
    variant !== (product.variant ?? '') ||
    notes !== (product.notes ?? '') ||
    (Number(price) || 0) !== (Number(product.price) || 0);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) return;
    setSaved(false);
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        code,
        name,
        variant,
        notes,
        price: Math.max(0, Number(price) || 0),
      });
      setSaved(true);
    } catch {
      // El error se muestra vía updateProduct.error
    }
  }

  async function handleDelete() {
    if (!product) return;
    try {
      await archiveProduct.mutateAsync(product.id);
      navigate('/products', { replace: true });
    } catch {
      // El error se muestra vía archiveProduct.error
    }
  }

  return (
    <div className="space-y-5">
      <Link
        to="/products"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Productos
      </Link>

      {/* Código QR */}
      <section className="space-y-2">
        <h3 className="px-1 font-display text-sm font-semibold">Código QR</h3>
        <QrPreview value={product.code} label={product.name} />
        {dirty && code !== product.code && (
          <p className="px-1 text-xs text-muted-foreground">
            Guarda los cambios para regenerar el QR con el nuevo código.
          </p>
        )}
      </section>

      {/* Editar datos */}
      <Card className="space-y-4 p-4">
        <h3 className="font-display text-sm font-semibold">Datos del producto</h3>
        <form className="space-y-4" onSubmit={handleSave}>
          <Field label="Código" hint="Cambiarlo genera un QR distinto" required>
            <Input
              required
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setSaved(false);
              }}
              disabled={updateProduct.isPending}
              autoCapitalize="characters"
            />
          </Field>
          <Field label="Nombre" required>
            <Input
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              disabled={updateProduct.isPending}
            />
          </Field>
          <Field label="Variante" hint="Opcional">
            <Input
              value={variant}
              onChange={(e) => {
                setVariant(e.target.value);
                setSaved(false);
              }}
              disabled={updateProduct.isPending}
            />
          </Field>
          <Field label="Precio base (€/ud)" hint="PVP de referencia para ventas y valor de almacén">
            <Input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setSaved(false);
              }}
              placeholder="0,00"
              disabled={updateProduct.isPending}
            />
          </Field>
          <Field label="Notas" hint="Opcional">
            <Textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setSaved(false);
              }}
              rows={2}
              disabled={updateProduct.isPending}
            />
          </Field>

          <div className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            Stock actual: <strong className="text-foreground tabular-nums">{product.stock}</strong>.
            Se actualiza con entradas y salidas, no se edita aquí.
          </div>

          {updateProduct.isError && (
            <p className="text-sm text-destructive" role="alert">
              {updateProduct.error.message}
            </p>
          )}
          {saved && !dirty && (
            <p className="flex items-center gap-1.5 text-sm text-ok">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Cambios guardados.
            </p>
          )}

          <Button type="submit" disabled={!dirty} loading={updateProduct.isPending}>
            Guardar cambios
          </Button>
        </form>
      </Card>

      {/* Zona de peligro */}
      <section className="space-y-2">
        <h3 className="px-1 font-display text-sm font-semibold text-destructive">
          Eliminar producto
        </h3>
        <Card className="space-y-3 border-destructive/40 p-4">
          <p className="text-sm text-muted-foreground">
            El producto dejará de aparecer en los listados. Su historial de movimientos se conserva.
          </p>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-input accent-[hsl(var(--destructive))]"
            />
            <span>
              Confirmo que quiero eliminar <strong>{product.name}</strong>.
            </span>
          </label>
          {archiveProduct.isError && (
            <p className="text-sm text-destructive" role="alert">
              {archiveProduct.error.message}
            </p>
          )}
          <Button
            variant="destructive"
            disabled={!confirmDelete}
            loading={archiveProduct.isPending}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Eliminar producto
          </Button>
        </Card>
      </section>
    </div>
  );
}
