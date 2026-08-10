import type { ReactNode } from 'react';
import { LogOut, Warehouse as WarehouseIcon } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useRole } from '@/features/auth/useRole';
import { Wordmark } from '@/components/brand/Wordmark';
import { EmptyState, IconButton, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import { WarehouseSwitcher } from '@/features/warehouses/WarehouseSwitcher';
import { useWarehouse } from '@/features/warehouses/useWarehouse';
import { BottomNav } from './BottomNav';
import { NAV_ITEMS_BY_ROLE } from './navItems';

interface AppShellProps {
  children: ReactNode;
}

/**
 * Sin almacén no hay nada que enseñar: todas las consultas van filtradas por
 * él y se quedarían esperando para siempre. Pasa con una cuenta recién creada a
 * la que todavía no se le ha dado acceso a ningún almacén.
 */
function NoWarehouse({ loading, error }: { loading: boolean; error: Error | null }) {
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Spinner /> Cargando…
      </div>
    );
  }
  return (
    <EmptyState
      icon={WarehouseIcon}
      title={error ? 'No se pudieron cargar los almacenes' : 'Sin almacén asignado'}
      description={
        error
          ? error.message
          : 'Todavía no tienes acceso a ningún almacén. Pídele a administración que te dé acceso.'
      }
    />
  );
}

export function AppShell({ children }: AppShellProps) {
  const { user, signOut } = useAuth();
  const role = useRole();
  const warehouse = useWarehouse();
  // Cada rol tiene su propia navegación.
  const navItems = role.data ? NAV_ITEMS_BY_ROLE[role.data] : [];
  const showNav = !!role.data;
  // Al admin no se le bloquea: si no queda ningún almacén (todos archivados)
  // tiene que poder llegar a Almacenes para crear uno.
  const hasWarehouse = !!warehouse.currentId || role.data === 'admin';

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-3 px-4">
          <Wordmark />
          <WarehouseSwitcher />
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
          showNav && hasWarehouse
            ? 'pb-[calc(5.5rem+env(safe-area-inset-bottom))]'
            : 'pb-[calc(1.5rem+env(safe-area-inset-bottom))]',
        )}
      >
        {hasWarehouse ? (
          children
        ) : (
          <NoWarehouse loading={warehouse.loading} error={warehouse.error} />
        )}
      </main>

      {showNav && hasWarehouse && <BottomNav items={navItems} />}
    </div>
  );
}
