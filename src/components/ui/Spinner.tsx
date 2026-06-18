import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label = 'Cargando' }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center">
      <Loader2 className={cn('h-4 w-4 animate-spin', className)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
