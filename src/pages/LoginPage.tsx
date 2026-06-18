import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Field, Input, Button } from '@/components/ui';

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
    <AuthLayout title="Argus" subtitle="Accede con tu email y contraseña.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Email">
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@empresa.com"
            disabled={submitting}
          />
        </Field>
        <Field label="Contraseña">
          <Input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={submitting}
          />
        </Field>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" loading={submitting}>
          Entrar
        </Button>
      </form>

      <div className="space-y-2 text-center text-sm">
        <Link
          to="/forgot-password"
          className="text-muted-foreground underline-offset-2 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
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
    </AuthLayout>
  );
}
