import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Field, Input, Button, Card } from '@/components/ui';

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Crear cuenta" subtitle="Regístrate con tu email y una contraseña.">
      {sent ? (
        <div className="space-y-4">
          <Card className="flex items-start gap-3 p-4 text-sm">
            <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-ok" aria-hidden="true" />
            <span>
              Hemos enviado un email de confirmación a <strong>{email}</strong>. Ábrelo desde este
              dispositivo para activar tu cuenta y entrar.
            </span>
          </Card>
          <p className="text-center text-sm">
            <Link to="/login" className="text-muted-foreground underline-offset-2 hover:underline">
              Volver a iniciar sesión
            </Link>
          </p>
        </div>
      ) : (
        <>
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
            <Field label="Contraseña" hint="Mínimo 6 caracteres">
              <Input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={submitting}
              />
            </Field>
            <Field label="Repite la contraseña">
              <Input
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
              Crear cuenta
            </Button>
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
    </AuthLayout>
  );
}
