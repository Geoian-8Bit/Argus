import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

export function AuthCallbackPage() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Iniciando sesión…
      </div>
    );
  }

  return <Navigate to={session ? '/' : '/login'} replace />;
}
