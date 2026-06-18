import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type BadgeTone = 'neutral' | 'ok' | 'warning' | 'danger' | 'brand';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  ok: 'bg-ok/15 text-ok',
  warning: 'bg-warning/20 text-warning',
  danger: 'bg-destructive/15 text-destructive',
  brand: 'bg-brand/15 text-brand',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
