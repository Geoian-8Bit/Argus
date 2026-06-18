import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { relativeTime, timeLabel } from '@/lib/format';
import type { MovementWithProduct } from './useMovements';

interface MovementItemProps {
  movement: MovementWithProduct;
  /** "relative" (Home) o "time" (Historial agrupado por día). */
  timeFormat?: 'relative' | 'time';
}

export function MovementItem({ movement, timeFormat = 'relative' }: MovementItemProps) {
  const isIn = movement.type === 'in';
  const Icon = isIn ? ArrowDownToLine : ArrowUpFromLine;
  const name = movement.products?.name ?? 'Producto eliminado';
  const variant = movement.products?.variant;
  const when =
    timeFormat === 'time' ? timeLabel(movement.created_at) : relativeTime(movement.created_at);

  return (
    <li className="flex items-center gap-3 py-3">
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          isIn ? 'bg-ok/15 text-ok' : 'bg-destructive/15 text-destructive',
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {name}
          {variant ? <span className="text-muted-foreground"> · {variant}</span> : null}
        </p>
        <p className="text-xs text-muted-foreground">{when}</p>
      </div>
      <span
        className={cn(
          'shrink-0 text-sm font-semibold tabular-nums',
          isIn ? 'text-ok' : 'text-destructive',
        )}
      >
        {isIn ? '+' : '−'}
        {movement.qty}
      </span>
    </li>
  );
}
