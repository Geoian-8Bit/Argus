import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

export function ResetPasswordPage() {
  const { session, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Cargando…
      </div>
    );
  }

  // El enlace de recuperación abre la app con una sesión temporal. Sin ella,
  // el enlace es inválido o ha caducado.
  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Enlace no válido</h1>
          <p className="text-sm text-muted-foreground">
            El enlace para restablecer la contraseña no es válido o ha caducado.
          </p>
          <p className="text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              Solicitar uno nuevo
            </Link>
          </p>
        </div>
      </div>
    );
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
      await updatePassword(password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña.');
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <header className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Nueva contraseña</h1>
          <p className="text-sm text-muted-foreground">
            Elige una contraseña nueva para tu cuenta.
          </p>
        </header>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Nueva contraseña</span>
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
            disabled={submitting || password.length === 0}
            className="w-full rounded-md bg-primary py-2 text-primary-foreground disabled:opacity-50"
          >
            {submitting ? 'Guardando…' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
