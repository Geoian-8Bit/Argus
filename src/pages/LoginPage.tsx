import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

export function LoginPage() {
  const { session, loading, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && session) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmail(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el enlace.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <header className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">QR Stock</h1>
          <p className="text-sm text-muted-foreground">
            Accede con tu email. Recibirás un enlace para entrar sin contraseña.
          </p>
        </header>

        {sent ? (
          <div className="rounded-lg border border-border p-4 text-sm">
            Hemos enviado un enlace a <strong>{email}</strong>. Ábrelo desde este dispositivo para
            entrar.
          </div>
        ) : (
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

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={submitting || email.trim().length === 0}
              className="w-full rounded-md bg-primary py-2 text-primary-foreground disabled:opacity-50"
            >
              {submitting ? 'Enviando…' : 'Enviarme el enlace'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
