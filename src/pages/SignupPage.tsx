import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

export function SignupPage() {
  const { session, loading, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && session) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      const { needsConfirmation } = await signUp(email.trim(), password);
      if (needsConfirmation) {
        setSent(true);
      }
      // Si no hace falta confirmar, onAuthStateChange creará la sesión y
      // el guard de arriba redirige a la app automáticamente.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <header className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Crear cuenta</h1>
          <p className="text-sm text-muted-foreground">Regístrate con tu email y una contraseña.</p>
        </header>

        {sent ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-border p-4 text-sm">
              Hemos enviado un email de confirmación a <strong>{email}</strong>. Ábrelo desde este
              dispositivo para activar tu cuenta y entrar.
            </div>
            <p className="text-center text-sm">
              <Link
                to="/login"
                className="text-muted-foreground underline-offset-2 hover:underline"
              >
                Volver a iniciar sesión
              </Link>
            </p>
          </div>
        ) : (
          <>
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
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
                  disabled={submitting}
                />
              </label>

              <label className="block space-y-1 text-sm">
                <span className="font-medium">Repite la contraseña</span>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
                  disabled={submitting}
                />
              </label>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={submitting || email.trim().length === 0}
                className="w-full rounded-md bg-primary py-2 text-primary-foreground disabled:opacity-50"
              >
                {submitting ? 'Creando…' : 'Crear cuenta'}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                Iniciar sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
