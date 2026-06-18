import type { ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useRole } from '@/features/auth/useRole';
import { Wordmark } from '@/components/brand/Wordmark';
import { IconButton } from '@/components/ui';
import { cn } from '@/lib/utils';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, signOut } = useAuth();
  const role = useRole();
  // La barra de navegación es solo para admin; staff solo escanea.
  const showNav = role.data === 'admin';

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-2 px-4">
          <Wordmark />
          {user && (
            <IconButton aria-label="Cerrar sesión" onClick={() => void signOut()}>
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </IconButton>
          )}
        </div>
      </header>

      <main
        className={cn(
          'mx-auto w-full max-w-lg flex-1 px-4 pt-5',
          showNav
            ? 'pb-[calc(5.5rem+env(safe-area-inset-bottom))]'
            : 'pb-[calc(1.5rem+env(safe-area-inset-bottom))]',
        )}
      >
        {children}
      </main>

      {showNav && <BottomNav />}
    </div>
  );
}
