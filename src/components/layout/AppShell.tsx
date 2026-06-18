import type { ReactNode } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold">QR Stock</h1>
        {user && (
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Cerrar sesión
          </button>
        )}
      </header>
      <main className="flex-1 overflow-y-auto px-4 pb-20 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
