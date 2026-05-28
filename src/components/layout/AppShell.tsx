import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold">QR Stock</h1>
      </header>
      <main className="flex-1 overflow-y-auto px-4 pb-20 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
