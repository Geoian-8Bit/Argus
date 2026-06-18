import { cn } from '@/lib/utils';
import { stockStatus, type StockStatus } from '@/features/products/constants';

const DOT: Record<StockStatus, string> = {
  ok: 'bg-ok',
  low: 'bg-warning',
  out: 'bg-destructive',
};

const SR_LABEL: Record<StockStatus, string> = {
  ok: 'en stock',
  low: 'stock bajo',
  out: 'sin stock',
};

interface StockBadgeProps {
  stock: number;
  className?: string;
}

// Chip con número de stock + punto de color según estado. El texto va en
// `foreground` (alto contraste) y el color es solo refuerzo, no único indicador.
export function StockBadge({ stock, className }: StockBadgeProps) {
  const status = stockStatus(stock);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground',
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', DOT[status])} aria-hidden="true" />
      <span className="tabular-nums">{stock}</span>
      <span className="sr-only"> unidades, {SR_LABEL[status]}</span>
    </span>
  );
}
