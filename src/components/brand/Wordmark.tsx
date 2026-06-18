import { cn } from '@/lib/utils';
import { ArgusMark } from './ArgusMark';

interface WordmarkProps {
  className?: string;
  /** Renderiza como h1 (para cabeceras principales de pantalla). */
  as?: 'h1' | 'div';
}

export function Wordmark({ className, as = 'div' }: WordmarkProps) {
  const Tag = as;
  return (
    <Tag className={cn('flex items-center gap-2', className)}>
      <ArgusMark className="h-6 w-6 text-brand" />
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        Argus
      </span>
    </Tag>
  );
}
