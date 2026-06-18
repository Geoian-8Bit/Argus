import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // Obligatorio: un botón de solo icono necesita nombre accesible.
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
IconButton.displayName = 'IconButton';
