import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  PackageX,
  Trash2,
  CheckCircle2,
  Archive,
  RotateCcw,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react';
import { useProduct } from '@/features/products/useProduct';
import { useUpdateProduct } from '@/features/products/useUpdateProduct';
import { useArchiveProduct } from '@/features/products/useArchiveProduct';
import { useRestoreProduct } from '@/features/products/useRestoreProduct';
import { useCreateProductGroup } from '@/features/products/useProductGroups';
import { useRegisterMovement, type MovementType } from '@/features/movements/useRegisterMovement';
import { GroupSelect, NEW_GROUP } from '@/features/products/GroupSelect';
import { QrPreview } from '@/features/products/QrPreview';
import {
  Card,
  Button,
  ButtonLink,
  Field,
  Input,
  Textarea,
  Spinner,
  StockBadge,
  EmptyState,
} from '@/components/ui';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const productQuery = useProduct(id);
  const updateProduct = useUpdateProduct();
  const archiveProduct = useArchiveProduct();
  const restoreProduct = useRestoreProduct();
  const createGroup = useCreateProductGroup();
  const registerMovement = useRegisterMovement();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [variant, setVariant] = useState('');
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState('');
  const [minStock, setMinStock] = useState('');
  const [group, setGroup] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [adjustQty, setAdjustQty] = useState('1');
  const [adjustDir, setAdjustDir] = useState<MovementType | null>(null);
  const [adjustDone, setAdjustDone] = useState<string | null>(null);

  const product = productQuery.data ?? null;

  // El detalle siempre se abre arriba; el listado restaura su propio scroll al volver.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (product) {
      setCode(product.code);
      setName(product.name);
      setVariant(product.variant ?? '');
      setNotes(product.notes ?? '');
      setPrice(String(Number(product.price) || 0));
      setMinStock(String(product.min_stock ?? 0));
      setGroup(product.group_id ?? '');
      setNewGroupName('');
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

  const groupDirty =
    group === NEW_GROUP
      ? newGroupName.trim().length > 0
      : (group || null) !== (product.group_id ?? null);
  const dirty =
    code !== product.code ||
    name !== product.name ||
    variant !== (product.variant ?? '') ||
    notes !== (product.notes ?? '') ||
    (Number(price) || 0) !== (Number(product.price) || 0) ||
    (Math.trunc(Number(minStock)) || 0) !== (product.min_stock ?? 0) ||
    groupDirty;

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) return;
    setSaved(false);
    try {
      let groupId: string | null = group && group !== NEW_GROUP ? group : null;
      if (group === NEW_GROUP) {
        const newGroup = await createGroup.mutateAsync(newGroupName);
        groupId = newGroup.id;
      }
      await updateProduct.mutateAsync({
        id: product.id,
        code,
        name,
        variant,
        notes,
        price: Math.max(0, Number(price) || 0),
        minStock: Math.max(0, Math.trunc(Number(minStock)) || 0),
        groupId,
      });
      setSaved(true);
    } catch {
      // El error se muestra vía updateProduct.error / createGroup.error
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

  async function handleReactivate() {
    if (!product) return;
    try {
      // Invalida la query del producto: al recargar, archived_at pasa a null
      // y la ficha vuelve a mostrar la zona de "Eliminar".
      await restoreProduct.mutateAsync(product.id);
    } catch {
      // El error se muestra vía restoreProduct.error
    }
  }

  const isArchived = Boolean(product.archived_at);
  const adjustQtyNum = Math.trunc(Number(adjustQty));
  const adjustQtyValid = Number.isFinite(adjustQtyNum) && adjustQtyNum >= 1;

  async function handleAdjust(type: MovementType) {
    if (!product || !adjustQtyValid || registerMovement.isPending) return;
    setAdjustDir(type);
    setAdjustDone(null);
    try {
      await registerMovement.mutateAsync({
        productId: product.id,
        productCode: product.code,
        type,
        qty: adjustQtyNum,
        note: 'Ajuste manual desde ficha',
        // Ajuste de inventario, no una venta: la salida no genera ingresos.
        unitPrice: type === 'out' ? 0 : null,
      });
      setAdjustDone(`${type === 'in' ? '+' : '−'}${adjustQtyNum} unidades`);
      setAdjustQty('1');
    } catch {
      // El error se muestra vía registerMovement.error
    } finally {
      setAdjustDir(null);
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

      {isArchived && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <Archive className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Producto <strong className="text-foreground">archivado</strong>. No aparece en los
            listados salvo al buscarlo. Reactívalo abajo para volver a usarlo.
          </span>
        </div>
      )}

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

      {/* Ajuste manual de stock (solo admin: la ruta ya está protegida) */}
      {!isArchived && (
        <Card className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-sm font-semibold">Ajustar stock</h3>
            <StockBadge stock={product.stock} minStock={product.min_stock} />
          </div>
          <p className="text-xs text-muted-foreground">
            Añade o retira unidades a mano, sin escanear el QR.
          </p>
          <Field label="Cantidad">
            <Input
              type="number"
              min={1}
              inputMode="numeric"
              value={adjustQty}
              onChange={(e) => {
                setAdjustQty(e.target.value);
                setAdjustDone(null);
              }}
              disabled={registerMovement.isPending}
            />
          </Field>

          {registerMovement.isError && (
            <p className="text-sm text-destructive" role="alert">
              {registerMovement.error.message}
            </p>
          )}
          {adjustDone && (
            <p className="flex items-center gap-1.5 text-sm text-ok">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Stock ajustado: {adjustDone}.
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleAdjust('in')}
              loading={registerMovement.isPending && adjustDir === 'in'}
              disabled={!adjustQtyValid || registerMovement.isPending}
            >
              {!(registerMovement.isPending && adjustDir === 'in') && (
                <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
              )}
              Añadir
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleAdjust('out')}
              loading={registerMovement.isPending && adjustDir === 'out'}
              disabled={!adjustQtyValid || registerMovement.isPending}
            >
              {!(registerMovement.isPending && adjustDir === 'out') && (
                <ArrowUpFromLine className="h-4 w-4" aria-hidden="true" />
              )}
              Quitar
            </Button>
          </div>
        </Card>
      )}

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
          <GroupSelect
            value={group}
            onChange={(value) => {
              setGroup(value);
              setSaved(false);
            }}
            newName={newGroupName}
            onNewNameChange={(value) => {
              setNewGroupName(value);
              setSaved(false);
            }}
            disabled={updateProduct.isPending || createGroup.isPending}
          />
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
          <Field
            label="Aviso de stock bajo (uds)"
            hint="En rojo cuando queden estas unidades o menos"
          >
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={minStock}
              onChange={(e) => {
                setMinStock(e.target.value);
                setSaved(false);
              }}
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
            Se ajusta con entradas y salidas o con «Ajustar stock» arriba, no en este formulario.
          </div>

          {(updateProduct.isError || createGroup.isError) && (
            <p className="text-sm text-destructive" role="alert">
              {updateProduct.error?.message ?? createGroup.error?.message}
            </p>
          )}
          {saved && !dirty && (
            <p className="flex items-center gap-1.5 text-sm text-ok">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Cambios guardados.
            </p>
          )}

          <Button
            type="submit"
            disabled={!dirty}
            loading={updateProduct.isPending || createGroup.isPending}
          >
            Guardar cambios
          </Button>
        </form>
      </Card>

      {/* Zona de peligro / reactivación */}
      {isArchived ? (
        <section className="space-y-2">
          <h3 className="px-1 font-display text-sm font-semibold">Reactivar producto</h3>
          <Card className="space-y-3 p-4">
            <p className="text-sm text-muted-foreground">
              Volverá a aparecer en los listados y podrá escanearse y venderse de nuevo.
            </p>
            {restoreProduct.isError && (
              <p className="text-sm text-destructive" role="alert">
                {restoreProduct.error.message}
              </p>
            )}
            <Button loading={restoreProduct.isPending} onClick={handleReactivate}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reactivar producto
            </Button>
          </Card>
        </section>
      ) : (
        <section className="space-y-2">
          <h3 className="px-1 font-display text-sm font-semibold text-destructive">
            Eliminar producto
          </h3>
          <Card className="space-y-3 border-destructive/40 p-4">
            <p className="text-sm text-muted-foreground">
              El producto dejará de aparecer en los listados. Su historial de movimientos se
              conserva y podrás reactivarlo buscándolo.
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
      )}
    </div>
  );
}
