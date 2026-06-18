import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

// El <label> envuelve el control, así queda asociado sin necesidad de id
// (compatible con getByLabelText en los tests).
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-muted-foreground"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="block text-xs text-muted-foreground">{hint}</span>}
      {error && (
        <span className="block text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
