import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatTileProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: 'default' | 'warning';
  className?: string;
}

export function StatTile({ label, value, icon: Icon, tone = 'default', className }: StatTileProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-3 shadow-sm', className)}>
      {Icon && (
        <span
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg',
            tone === 'warning' ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      <p
        className={cn(
          'mt-2 font-display text-2xl font-semibold leading-none tabular-nums',
          tone === 'warning' && 'text-warning',
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
