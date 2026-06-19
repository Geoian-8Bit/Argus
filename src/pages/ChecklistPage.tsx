import { useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import {
  CHECKLIST,
  CHECKLIST_TOTAL,
  defaultChecklistState,
  missingItemIds,
  type ChecklistState,
} from '@/features/checklist/items';
import { useSubmitChecklist } from '@/features/checklist/useSubmitChecklist';
import { PageHeader, Card, Button, ButtonLink, Field, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';

export function ChecklistPage() {
  const [state, setState] = useState<ChecklistState>(defaultChecklistState);
  const [note, setNote] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const submit = useSubmitChecklist();
  const missing = missingItemIds(state);

  function toggle(id: string) {
    setState((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function resetAll() {
    setState(defaultChecklistState());
    setNote('');
  }

  async function handleSave() {
    try {
      const row = await submit.mutateAsync({ items: state, note });
      setSavedAt(row.created_at);
    } catch {
      // El error se muestra vía submit.error
    }
  }

  function newReview() {
    resetAll();
    setSavedAt(null);
    submit.reset();
  }

  if (savedAt) {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ok/15 text-ok">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold tracking-tight">Revisión guardada</h2>
            <p className="text-sm text-muted-foreground">
              {missing.length === 0
                ? 'Todo el material marcado como presente.'
                : `${missing.length} de ${CHECKLIST_TOTAL} marcados como falta.`}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={newReview}>Nueva revisión</Button>
          <ButtonLink to="/" variant="outline">
            Inicio
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-20">
      <PageHeader
        title="Material en furgoneta"
        subtitle="Marca lo que NO llevas; el resto queda como presente."
        action={
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Todo presente
          </button>
        }
      />

      <div className="space-y-5">
        {CHECKLIST.map((category) => {
          const catMissing = category.items.filter((i) => state[i.id] === false).length;
          return (
            <section key={category.id} className="space-y-2">
              <h3 className="flex items-center justify-between px-1">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {category.label}
                </span>
                {catMissing > 0 && (
                  <span className="text-xs font-semibold tabular-nums text-destructive">
                    {catMissing} falta{catMissing > 1 ? 'n' : ''}
                  </span>
                )}
              </h3>
              <Card>
                <ul className="divide-y divide-border px-4">
                  {category.items.map((item) => {
                    const present = state[item.id] !== false;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={present}
                          onClick={() => toggle(item.id)}
                          className="flex w-full items-center justify-between gap-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        >
                          <span
                            className={cn(
                              'text-sm',
                              present ? 'text-foreground' : 'text-muted-foreground line-through',
                            )}
                          >
                            {item.label}
                          </span>
                          <span
                            className={cn(
                              'inline-flex h-7 w-12 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                              present ? 'bg-ok/15 text-ok' : 'bg-destructive/15 text-destructive',
                            )}
                          >
                            {present ? 'Sí' : 'No'}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </section>
          );
        })}

        <Field label="Observaciones" hint="Opcional">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Cualquier nota para administración…"
            disabled={submit.isPending}
          />
        </Field>

        {submit.isError && (
          <p className="text-sm text-destructive" role="alert">
            {submit.error.message}
          </p>
        )}
      </div>

      {/* Barra de guardado fija, justo encima de la navegación inferior. */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <p className="flex-1 text-sm text-muted-foreground">
            {missing.length === 0 ? (
              <span className="font-medium text-ok">Todo presente</span>
            ) : (
              <>
                <span className="font-semibold tabular-nums text-destructive">
                  {missing.length}
                </span>{' '}
                de {CHECKLIST_TOTAL} marcados como falta
              </>
            )}
          </p>
          <Button className="w-auto" loading={submit.isPending} onClick={handleSave}>
            Guardar revisión
          </Button>
        </div>
      </div>
    </div>
  );
}
