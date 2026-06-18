import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { Spinner } from '@/components/ui';

export function AuthCallbackPage() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center gap-2 bg-background text-sm text-muted-foreground">
        <Spinner /> Iniciando sesión…
      </div>
    );
  }

  return <Navigate to={session ? '/' : '/login'} replace />;
}
