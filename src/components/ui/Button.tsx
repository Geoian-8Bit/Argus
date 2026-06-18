import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';
import { buttonClasses, type ButtonVariant, type ButtonSize } from './buttonClasses';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      className={buttonClasses(variant, size, cn('w-full', className))}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
