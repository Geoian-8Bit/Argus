import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Field, Input, Button, Card } from '@/components/ui';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el email.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Recuperar contraseña" subtitle="Te enviaremos un enlace para restablecerla.">
      {sent ? (
        <div className="space-y-4">
          <Card className="flex items-start gap-3 p-4 text-sm">
            <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-ok" aria-hidden="true" />
            <span>
              Si <strong>{email}</strong> tiene una cuenta, le hemos enviado un enlace para
              restablecer la contraseña. Ábrelo desde este dispositivo.
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

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" loading={submitting}>
              Enviar enlace
            </Button>
          </form>

          <p className="text-center text-sm">
            <Link to="/login" className="text-muted-foreground underline-offset-2 hover:underline">
              Volver a iniciar sesión
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
