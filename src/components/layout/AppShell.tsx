import type { ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { Wordmark } from '@/components/brand/Wordmark';
import { IconButton } from '@/components/ui';
import { ThemeSwitcher } from '@/theme/ThemeSwitcher';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-2 px-4">
          <Wordmark />
          <div className="flex items-center gap-1">
            <ThemeSwitcher />
            {user && (
              <IconButton aria-label="Cerrar sesión" onClick={() => void signOut()}>
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </IconButton>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-5">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
