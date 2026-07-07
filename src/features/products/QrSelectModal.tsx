import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  X,
  Check,
  SearchX,
  QrCode,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ListOrdered,
} from 'lucide-react';
import { useProducts } from './useProducts';
import { cn } from '@/lib/utils';
import { Button, Input, Spinner } from '@/components/ui';

interface QrSelectModalProps {
  /** Cierra el modal sin exportar nada. */
  onClose: () => void;
  /** Se invoca con los códigos de los productos seleccionados, en el orden elegido, al pulsar «Descargar». */
  onConfirm: (codes: string[]) => void;
}

type Step = 'select' | 'order';

/**
 * Modal en dos pasos para generar el PDF de códigos QR:
 *   1. «Seleccionar»: lista de productos activos con filtro de texto; al pulsar
 *      un producto se marca/desmarca.
 *   2. «Ordenar»: los productos elegidos se muestran en el orden en que se
 *      colocarán en el PDF; se pueden reordenar (subir/bajar) o quitar.
 * La selección se guarda como una lista ordenada (el orden por defecto es el de
 * pulsación), de modo que el usuario decide en qué orden aparecen en el PDF.
 * Se monta solo cuando está abierto, así que su estado se reinicia cada vez.
 */
export function QrSelectModal({ onClose, onConfirm }: QrSelectModalProps) {
  const products = useProducts('');
  const [step, setStep] = useState<Step>('select');
  const [filter, setFilter] = useState('');
  // Lista ordenada de ids seleccionados; el orden es el que tendrán en el PDF.
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Cerrar con la tecla Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const all = useMemo(() => products.data ?? [], [products.data]);
  const byId = useMemo(() => new Map(all.map((p) => [p.id, p])), [all]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

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
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const filteredIds = filtered.map((p) => p.id);
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedSet.has(id));

  function toggleAll() {
    setSelectedIds((prev) => {
      if (allFilteredSelected) {
        const remove = new Set(filteredIds);
        return prev.filter((id) => !remove.has(id));
      }
      // Añade al final los que aún no estaban, en el orden del filtro.
      const missing = filteredIds.filter((id) => !prev.includes(id));
      return [...prev, ...missing];
    });
  }

  // Reordenar: mueve el elemento `index` una posición arriba o abajo.
  function move(index: number, dir: -1 | 1) {
    setSelectedIds((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  function handleConfirm() {
    const codes = selectedIds
      .map((id) => byId.get(id)?.code.trim() ?? '')
      .filter((code) => code.length > 0);
    if (codes.length === 0) return;
    onConfirm(codes);
  }

  const count = selectedIds.length;
  // Productos seleccionados, en orden, para el paso «Ordenar».
  const ordered = useMemo(
    () => selectedIds.map((id) => byId.get(id)).filter((p): p is NonNullable<typeof p> => !!p),
    [selectedIds, byId],
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Seleccionar productos para el PDF de QR"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      <div
        className="absolute inset-0 animate-fade-in bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex max-h-[88vh] w-full max-w-md animate-modal-in flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-lg sm:max-h-[85vh] sm:rounded-2xl">
        {/* Cabecera */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          {step === 'order' ? (
            <button
              type="button"
              onClick={() => setStep('select')}
              aria-label="Volver a la selección"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : (
            <QrCode className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-semibold leading-tight">
              {step === 'order' ? 'Ordenar el PDF' : 'Descargar QR en PDF'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {step === 'order'
                ? 'Ordena cómo aparecerán en el PDF.'
                : 'Selecciona los productos a incluir.'}
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

        {step === 'select' ? (
          <>
            {/* Filtro + seleccionar todos */}
            <div className="space-y-2 border-b border-border px-4 py-3">
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
                  {count} seleccionado{count === 1 ? '' : 's'}
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

            {/* Lista */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {products.isLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <Spinner /> Cargando productos…
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-12 text-center text-sm text-muted-foreground">
                  <SearchX className="h-6 w-6" aria-hidden="true" />
                  {all.length === 0
                    ? 'No hay productos activos.'
                    : 'Sin resultados para el filtro.'}
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {filtered.map((p) => {
                    const isSel = selectedSet.has(p.id);
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
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Pie: cancelar / continuar a ordenar */}
            <div className="flex items-center gap-3 border-t border-border px-4 py-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                className="w-auto"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="md"
                className="flex-1"
                onClick={() => setStep('order')}
                disabled={count === 0}
              >
                <ListOrdered className="h-4 w-4" aria-hidden="true" />
                Ordenar{count > 0 ? ` (${count})` : ''}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Lista ordenable */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <ul className="divide-y divide-border">
                {ordered.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-2 px-3 py-2.5">
                    <span className="w-6 shrink-0 text-center font-mono text-xs tabular-nums text-muted-foreground">
                      {i + 1}
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
                      </span>
                    </span>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label={`Subir ${p.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <ArrowUp className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(i, 1)}
                        disabled={i === ordered.length - 1}
                        aria-label={`Bajar ${p.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        aria-label={`Quitar ${p.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pie: volver / descargar */}
            <div className="flex items-center gap-3 border-t border-border px-4 py-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                className="w-auto"
                onClick={() => setStep('select')}
              >
                Atrás
              </Button>
              <Button
                type="button"
                size="md"
                className="flex-1"
                onClick={handleConfirm}
                disabled={count === 0}
              >
                <QrCode className="h-4 w-4" aria-hidden="true" />
                Descargar{count > 0 ? ` (${count})` : ''}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
