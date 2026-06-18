import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
  outline: 'border border-input bg-transparent hover:bg-muted',
  ghost: 'text-foreground hover:bg-muted',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}
