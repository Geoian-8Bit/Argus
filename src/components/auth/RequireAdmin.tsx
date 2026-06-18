import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '@/features/auth/useRole';
import { Spinner } from '@/components/ui';

interface RequireAdminProps {
  children: ReactNode;
}

// Protege rutas solo-admin. Staff es redirigido a Inicio.
export function RequireAdmin({ children }: RequireAdminProps) {
  const role = useRole();

  if (role.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Spinner /> Cargando…
      </div>
    );
  }

  if (role.data !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
