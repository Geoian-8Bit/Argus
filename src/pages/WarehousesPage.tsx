import { useMemo, useState, type FormEvent } from 'react';
import { Warehouse as WarehouseIcon, Plus, Pencil, Check, X, Archive } from 'lucide-react';
import { useUsers } from '@/features/users/useUsers';
import { useWarehouses, type Warehouse } from '@/features/warehouses/useWarehouses';
import {
  useWarehouseMembers,
  useCreateWarehouse,
  useRenameWarehouse,
  useArchiveWarehouse,
  useSetWarehouseMembers,
} from '@/features/warehouses/useWarehouseAdmin';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Field,
  Input,
  Button,
  Badge,
  EmptyState,
  Skeleton,
  IconButton,
} from '@/components/ui';

function CreateWarehouseForm() {
  const [name, setName] = useState('');
  const createWarehouse = useCreateWarehouse();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createWarehouse.mutateAsync(name);
      setName('');
    } catch {
      // El error queda expuesto vía createWarehouse.error.
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-brand" aria-hidden="true" />
          Nuevo almacén
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field
            label="Nombre"
            hint="Cada almacén es independiente: sus productos y movimientos no se mezclan con los de otro."
            required
          >
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Furgoneta de Marta"
              disabled={createWarehouse.isPending}
            />
          </Field>

          {createWarehouse.isError && (
            <p className="text-sm text-destructive" role="alert">
              {createWarehouse.error.message}
            </p>
          )}

          <Button type="submit" loading={createWarehouse.isPending}>
            Crear almacén
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface WarehouseCardProps {
  warehouse: Warehouse;
  memberIds: string[];
}

function WarehouseCard({ warehouse, memberIds }: WarehouseCardProps) {
  const users = useUsers();
  const rename = useRenameWarehouse();
  const archive = useArchiveWarehouse();
  const setMembers = useSetWarehouseMembers();

  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(warehouse.name);
  const [confirmingArchive, setConfirmingArchive] = useState(false);

  const error = rename.error ?? archive.error ?? setMembers.error;
  const selected = useMemo(() => new Set(memberIds), [memberIds]);

  // Un admin ve todos los almacenes sin estar en la lista, así que marcarlo
  // como miembro no aporta nada y solo confunde.
  const assignable = (users.data ?? []).filter((u) => u.role !== 'admin');

  async function saveName() {
    try {
      await rename.mutateAsync({ id: warehouse.id, name: draftName });
      setEditingName(false);
    } catch {
      // El error se muestra abajo.
    }
  }

  function toggleMember(userId: string) {
    const next = new Set(selected);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    setMembers.mutate({ warehouseId: warehouse.id, userIds: [...next] });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        {editingName ? (
          <div className="flex flex-1 items-center gap-1.5">
            <Input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              disabled={rename.isPending}
              className="h-8 text-sm"
            />
            <IconButton
              aria-label="Guardar nombre"
              className="h-8 w-8 shrink-0"
              disabled={rename.isPending}
              onClick={() => void saveName()}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            <IconButton
              aria-label="Cancelar"
              className="h-8 w-8 shrink-0"
              disabled={rename.isPending}
              onClick={() => {
                setDraftName(warehouse.name);
                setEditingName(false);
              }}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </div>
        ) : (
          <>
            <CardTitle className="flex min-w-0 items-center gap-1.5">
              <WarehouseIcon className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <span className="truncate">{warehouse.name}</span>
              <button
                type="button"
                aria-label={`Renombrar ${warehouse.name}`}
                onClick={() => {
                  setDraftName(warehouse.name);
                  setEditingName(true);
                }}
                className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </CardTitle>
            <Badge tone="neutral" className="shrink-0">
              {memberIds.length} {memberIds.length === 1 ? 'persona' : 'personas'}
            </Badge>
          </>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Quién accede
          </p>
          {users.isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : assignable.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay usuarios que asignar. Créalos en la página de Usuarios.
            </p>
          ) : (
            <ul className="space-y-1">
              {assignable.map((u) => (
                <li key={u.id}>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 text-sm transition-colors hover:bg-muted">
                    <input
                      type="checkbox"
                      className="h-4 w-4 shrink-0 accent-brand"
                      checked={selected.has(u.id)}
                      disabled={setMembers.isPending}
                      onChange={() => toggleMember(u.id)}
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {u.displayName || u.email || 'Sin email'}
                    </span>
                    <Badge tone="neutral" className="shrink-0">
                      {u.role === 'comercial' ? 'Comercial' : 'Staff'}
                    </Badge>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error.message}
          </p>
        )}

        {confirmingArchive ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              ¿Archivar? Deja de verse, no se borra nada.
            </span>
            <Button
              variant="destructive"
              size="sm"
              className="w-auto"
              loading={archive.isPending}
              onClick={() => archive.mutate(warehouse.id)}
            >
              Sí
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-auto"
              disabled={archive.isPending}
              onClick={() => setConfirmingArchive(false)}
            >
              No
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-auto"
            onClick={() => setConfirmingArchive(true)}
          >
            <Archive className="h-4 w-4" aria-hidden="true" />
            Archivar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function WarehousesPage() {
  const warehouses = useWarehouses();
  const members = useWarehouseMembers();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Almacenes"
        subtitle="Cada almacén tiene sus propios productos y movimientos. Aquí decides quién entra en cuál."
      />

      <CreateWarehouseForm />

      <section className="space-y-3">
        <h3 className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Almacenes existentes
        </h3>

        {warehouses.isLoading ? (
          <Card className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ) : warehouses.isError ? (
          <EmptyState
            icon={WarehouseIcon}
            title="No se pudieron cargar los almacenes"
            description={warehouses.error.message}
          />
        ) : (warehouses.data?.length ?? 0) > 0 ? (
          warehouses.data!.map((w) => (
            <WarehouseCard key={w.id} warehouse={w} memberIds={members.data?.[w.id] ?? []} />
          ))
        ) : (
          <EmptyState
            icon={WarehouseIcon}
            title="Sin almacenes"
            description="Crea el primero con el formulario de arriba."
          />
        )}
      </section>
    </div>
  );
}
