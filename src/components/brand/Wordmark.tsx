import { cn } from '@/lib/utils';

interface WordmarkProps {
  className?: string;
  /** Renderiza como h1 (para cabeceras principales de pantalla). */
  as?: 'h1' | 'div';
}

export function Wordmark({ className, as = 'div' }: WordmarkProps) {
  const Tag = as;
  return (
    <Tag className={cn('flex items-center gap-2', className)}>
      <img src="/argus-symbol.png" alt="" className="h-6 w-auto" />
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        Argus
      </span>
    </Tag>
  );
}
