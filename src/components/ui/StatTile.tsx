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
    <div className={cn('rounded-lg border border-border bg-card p-3 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <Icon
            className={cn('h-4 w-4', tone === 'warning' ? 'text-warning' : 'text-muted-foreground')}
            aria-hidden="true"
          />
        )}
      </div>
      <p
        className={cn(
          'mt-1 font-display text-2xl font-semibold tabular-nums',
          tone === 'warning' && 'text-warning',
        )}
      >
        {value}
      </p>
    </div>
  );
}
