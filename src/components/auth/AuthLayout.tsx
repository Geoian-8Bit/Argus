import type { ReactNode } from 'react';
import { ArgusMark } from '@/components/brand/ArgusMark';

interface AuthLayoutProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <header className="space-y-3 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <ArgusMark className="h-7 w-7" />
          </span>
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
