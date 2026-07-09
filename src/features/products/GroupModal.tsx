import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, Check, SearchX, FolderPlus, Pencil, Trash2 } from 'lucide-react';
import { useProducts } from './useProducts';
import {
  useProductGroups,
  useSaveProductGroup,
  useDeleteProductGroup,
  type ProductGroup,
} from './useProductGroups';
import { cn } from '@/lib/utils';
import { Button, Input, Spinner } from '@/components/ui';

interface GroupModalProps {
  /** Grupo a editar, o null para crear uno nuevo. */
  group: ProductGroup | null;
  onClose: () => void;
}

/**
 * Modal para crear o editar un grupo de productos: nombre + lista de todos los
 * productos con filtro y checks. Al guardar, los marcados quedan en el grupo y
 * los desmarcados que estaban se desvinculan. Se monta solo cuando está
 * abierto, así que su estado se reinicia cada vez.
 */
export function GroupModal({ group, onClose }: GroupModalProps) {
  const products = useProducts('');
  const groupsQuery = useProductGroups();
  const save = useSaveProductGroup();
  const deleteGroup = useDeleteProductGroup();

  const [name, setName] = useState(group?.name ?? '');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Cerrar con la tecla Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Al editar, marca los productos que ya pertenecen al grupo cuando cargue la lista.
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current || !group || !products.data) return;
    initialized.current = true;
    setSelected(new Set(products.data.filter((p) => p.group_id === group.id).map((p) => p.id)));
  }, [group, products.data]);

  const all = useMemo(() => products.data ?? [], [products.data]);
  const groupNames = useMemo(
    () => new Map((groupsQuery.data ?? []).map((g) => [g.id, g.name])),
    [groupsQuery.data],
  );

  const term = filter.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!term) return all;
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        (p.variant?.toLowerCase().includes(term) ?? false),
    );
  }, [all, term]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filteredIds = filtered.map((p) => p.id);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) filteredIds.forEach((id) => next.delete(id));
      else filteredIds.forEach((id) => next.add(id));
      return next;
    });
  }

  const isPending = save.isPending || deleteGroup.isPending;
  const count = selected.size;

  async function handleSave() {
    try {
      await save.mutateAsync({ id: group?.id, name, productIds: [...selected] });
      onClose();
    } catch {
      // El error se muestra vía save.error
    }
  }

  async function handleDelete() {
    if (!group) return;
    try {
      await deleteGroup.mutateAsync(group.id);
      onClose();
    } catch {
      // El error se muestra vía deleteGroup.error
    }
  }

  const HeaderIcon = group ? Pencil : FolderPlus;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={group ? 'Editar grupo de productos' : 'Nuevo grupo de productos'}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      <div
        className="absolute inset-0 animate-fade-in bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex max-h-[88vh] w-full max-w-md animate-modal-in flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-lg sm:max-h-[85vh] sm:rounded-2xl">
        {/* Cabecera */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <HeaderIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-semibold leading-tight">
              {group ? 'Editar grupo' : 'Nuevo grupo'}
            </h2>
            <p className="text-xs text-muted-foreground">
              Ponle nombre y marca los productos que lo forman.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Nombre + filtro + seleccionar todos */}
        <div className="space-y-2 border-b border-border px-4 py-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del grupo"
            aria-label="Nombre del grupo"
            disabled={isPending}
          />
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              inputMode="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrar por nombre o código"
              aria-label="Filtrar productos"
              className="pl-9"
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {count} producto{count === 1 ? '' : 's'} en el grupo
            </span>
            <button
              type="button"
              onClick={toggleAll}
              disabled={filteredIds.length === 0}
              className="font-medium text-primary transition-opacity hover:underline disabled:opacity-40"
            >
              {allFilteredSelected ? 'Quitar selección' : 'Seleccionar todos'}
            </button>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {products.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Spinner /> Cargando productos…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center text-sm text-muted-foreground">
              <SearchX className="h-6 w-6" aria-hidden="true" />
              {all.length === 0 ? 'No hay productos activos.' : 'Sin resultados para el filtro.'}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((p) => {
                const isSel = selected.has(p.id);
                const otherGroup =
                  p.group_id && p.group_id !== group?.id ? groupNames.get(p.group_id) : null;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => toggle(p.id)}
                      aria-pressed={isSel}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                        isSel ? 'bg-primary/10' : 'hover:bg-muted/60',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                          isSel
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input',
                        )}
                      >
                        {isSel && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {p.name}
                          {p.variant ? (
                            <span className="text-muted-foreground"> · {p.variant}</span>
                          ) : null}
                        </span>
                        <span className="block truncate font-mono text-xs text-muted-foreground">
                          {p.code}
                          {otherGroup ? (
                            <span className="font-sans"> · en {otherGroup}</span>
                          ) : null}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {(save.isError || deleteGroup.isError) && (
          <p className="border-t border-border px-4 py-2 text-sm text-destructive" role="alert">
            {save.error?.message ?? deleteGroup.error?.message}
          </p>
        )}

        {/* Pie: eliminar (solo al editar) / cancelar / guardar */}
        <div className="flex items-center gap-2 border-t border-border px-4 py-3">
          {group &&
            (confirmDelete ? (
              <Button
                type="button"
                variant="destructive"
                size="md"
                className="w-auto"
                onClick={handleDelete}
                loading={deleteGroup.isPending}
                title="Los productos del grupo quedarán sin grupo"
              >
                ¿Seguro?
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="md"
                className="w-auto border-destructive/40 text-destructive"
                onClick={() => setConfirmDelete(true)}
                disabled={isPending}
                title="Eliminar grupo"
                aria-label="Eliminar grupo"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            ))}
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-auto"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="md"
            className="flex-1"
            onClick={handleSave}
            loading={save.isPending}
            disabled={!name.trim() || deleteGroup.isPending}
          >
            Guardar{count > 0 ? ` (${count})` : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}
