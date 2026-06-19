import { ClipboardCheck, TriangleAlert } from 'lucide-react';
import { useChecklists } from './useChecklists';
import { CHECKLIST_LABELS, CHECKLIST_TOTAL, missingItemIds } from './items';
import { dayLabel, timeLabel } from '@/lib/format';
import { Card, Badge, EmptyState, Skeleton, Button } from '@/components/ui';

interface ChecklistReviewsProps {
  /** Muestra quién la rellenó (panel de administración). */
  showAuthor?: boolean;
}

export function ChecklistReviews({ showAuthor = false }: ChecklistReviewsProps) {
  const checklists = useChecklists();

  if (checklists.isLoading) {
    return (
      <Card className="space-y-3 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </Card>
    );
  }

  if (checklists.isError) {
    return (
      <EmptyState
        icon={TriangleAlert}
        title="No se pudo cargar"
        description="Revisa tu conexión e inténtalo de nuevo."
        action={
          <Button
            variant="outline"
            size="sm"
            className="w-auto"
            onClick={() => checklists.refetch()}
          >
            Reintentar
          </Button>
        }
      />
    );
  }

  const rows = checklists.data ?? [];
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Sin revisiones todavía"
        description="Cuando se registre una revisión de furgoneta aparecerá aquí."
      />
    );
  }

  return (
    <Card>
      <ul className="divide-y divide-border px-4">
        {rows.map((r) => {
          const missing = missingItemIds(r.items);
          const author = showAuthor ? (r.user_email?.split('@')[0] ?? 'desconocido') : null;
          return (
            <li key={r.id} className="space-y-2 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {dayLabel(r.created_at)} · {timeLabel(r.created_at)}
                  </p>
                  {author && (
                    <p
                      className="truncate text-xs text-muted-foreground"
                      title={r.user_email ?? undefined}
                    >
                      {author}
                    </p>
                  )}
                </div>
                <Badge tone={missing.length === 0 ? 'ok' : 'danger'} className="shrink-0">
                  {missing.length === 0
                    ? 'Completa'
                    : `Faltan ${missing.length}/${CHECKLIST_TOTAL}`}
                </Badge>
              </div>

              {missing.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {missing.map((id) => (
                    <span
                      key={id}
                      className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive"
                    >
                      {CHECKLIST_LABELS[id] ?? id}
                    </span>
                  ))}
                </div>
              )}

              {r.note && <p className="text-xs italic text-muted-foreground">“{r.note}”</p>}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
