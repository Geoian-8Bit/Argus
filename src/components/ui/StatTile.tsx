import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatTone = 'default' | 'warning' | 'ok' | 'destructive';

interface StatTileProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: StatTone;
  className?: string;
}

const ICON_TONE: Record<StatTone, string> = {
  default: 'bg-muted text-muted-foreground',
  warning: 'bg-warning/15 text-warning',
  ok: 'bg-ok/15 text-ok',
  destructive: 'bg-destructive/15 text-destructive',
};

const VALUE_TONE: Record<StatTone, string> = {
  default: '',
  warning: 'text-warning',
  ok: 'text-ok',
  destructive: 'text-destructive',
};

export function StatTile({ label, value, icon: Icon, tone = 'default', className }: StatTileProps) {
  return (
    <div
      className={cn(
        'flex min-h-[5.25rem] flex-col rounded-xl border border-border bg-card p-3 shadow-sm',
        className,
      )}
    >
      {Icon && (
        <span
          className={cn('flex h-7 w-7 items-center justify-center rounded-lg', ICON_TONE[tone])}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      <p
        className={cn(
          'mt-2 font-display text-2xl font-semibold leading-none tabular-nums',
          VALUE_TONE[tone],
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
