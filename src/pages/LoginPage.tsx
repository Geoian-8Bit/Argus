import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

export function LoginPage() {
  const { session, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && session) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <header className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Argus</h1>
          <p className="text-sm text-muted-foreground">Accede con tu email y contraseña.</p>
        </header>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@empresa.com"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
              disabled={submitting}
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">Contraseña</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
              disabled={submitting}
            />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={submitting || email.trim().length === 0 || password.length === 0}
            className="w-full rounded-md bg-primary py-2 text-primary-foreground disabled:opacity-50"
          >
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="space-y-2 text-center text-sm">
          <p>
            <Link
              to="/forgot-password"
              className="text-muted-foreground underline-offset-2 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
          <p className="text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link
              to="/signup"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
