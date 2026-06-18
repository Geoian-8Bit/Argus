import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Field, Input, Button, Spinner } from '@/components/ui';

export function ResetPasswordPage() {
  const { session, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center gap-2 text-sm text-muted-foreground">
        <Spinner /> Cargando…
      </div>
    );
  }

  // El enlace de recuperación abre la app con una sesión temporal. Sin ella,
  // el enlace es inválido o ha caducado.
  if (!session) {
    return (
      <AuthLayout
        title="Enlace no válido"
        subtitle="El enlace para restablecer la contraseña no es válido o ha caducado."
      >
        <p className="text-center text-sm">
          <Link
            to="/forgot-password"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            Solicitar uno nuevo
          </Link>
        </p>
      </AuthLayout>
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
    <AuthLayout title="Nueva contraseña" subtitle="Elige una contraseña nueva para tu cuenta.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Nueva contraseña" hint="Mínimo 6 caracteres">
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
          Guardar contraseña
        </Button>
      </form>
    </AuthLayout>
  );
}
