import { useState, type FormEvent } from 'react';
import {
  UserPlus,
  Users as UsersIcon,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import type { Role } from '@/features/auth/useRole';
import { useUsers, type UserProfile } from '@/features/users/useUsers';
import { useCreateUser } from '@/features/users/useCreateUser';
import { useUpdateUserRole } from '@/features/users/useUpdateUserRole';
import { useUpdateUserDisplayName } from '@/features/users/useUpdateUserDisplayName';
import { useDeleteUser } from '@/features/users/useDeleteUser';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Field,
  Input,
  Button,
  Badge,
  EmptyState,
  Skeleton,
  Spinner,
  IconButton,
} from '@/components/ui';
import { cn } from '@/lib/utils';

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: 'staff', label: 'Staff', hint: 'Solo escanea: entradas y salidas de stock.' },
  { value: 'admin', label: 'Admin', hint: 'Acceso total: panel, productos, historial y usuarios.' },
];

// Selector segmentado de rol, reutilizado en el formulario y en cada fila.
function RoleSelect({
  value,
  onChange,
  disabled,
  size = 'md',
  idPrefix,
}: {
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  idPrefix: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Rol"
      className={cn('flex gap-1 rounded-lg bg-muted p-1', disabled && 'opacity-60')}
    >
      {ROLES.map((r) => {
        const active = value === r.value;
        return (
          <button
            key={r.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={r.label}
            id={`${idPrefix}-${r.value}`}
            disabled={disabled}
            onClick={() => onChange(r.value)}
            className={cn(
              'flex-1 rounded-md font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

function CreateUserForm() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('staff');
  const [done, setDone] = useState<string | null>(null);

  const createUser = useCreateUser();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDone(null);
    try {
      const user = await createUser.mutateAsync({ email, password, role, displayName });
      setDone(user.displayName ?? user.email);
      setEmail('');
      setDisplayName('');
      setPassword('');
      setRole('staff');
    } catch {
      // El error queda expuesto vía createUser.error.
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-brand" aria-hidden="true" />
          Crear usuario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Email" required>
            <Input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setDone(null);
              }}
              placeholder="persona@empresa.com"
              disabled={createUser.isPending}
            />
          </Field>

          <Field label="Alias" hint="Se muestra en vez del email. Opcional.">
            <Input
              type="text"
              autoComplete="off"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setDone(null);
              }}
              placeholder="Nombre a mostrar"
              disabled={createUser.isPending}
            />
          </Field>

          <Field
            label="Contraseña inicial"
            hint="Mínimo 8 caracteres. La persona podrá cambiarla."
            required
          >
            <Input
              type="text"
              required
              autoComplete="off"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setDone(null);
              }}
              placeholder="••••••••"
              minLength={8}
              disabled={createUser.isPending}
            />
          </Field>

          <Field label="Rol">
            <RoleSelect
              idPrefix="new-role"
              value={role}
              onChange={setRole}
              disabled={createUser.isPending}
            />
            <span className="block text-xs text-muted-foreground">
              {ROLES.find((r) => r.value === role)?.hint}
            </span>
          </Field>

          {createUser.isError && (
            <p className="text-sm text-destructive" role="alert">
              {createUser.error.message}
            </p>
          )}

          {done && (
            <p className="flex items-center gap-2 text-sm text-ok" role="status">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Usuario <strong>{done}</strong> creado. Ya puede iniciar sesión.
            </p>
          )}

          <Button type="submit" loading={createUser.isPending}>
            Crear usuario
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function UserRow({ user, isSelf }: { user: UserProfile; isSelf: boolean }) {
  const updateRole = useUpdateUserRole();
  const updateDisplayName = useUpdateUserDisplayName();
  const deleteUser = useDeleteUser();
  const [confirming, setConfirming] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(user.displayName ?? '');

  const error = updateRole.error ?? deleteUser.error ?? updateDisplayName.error;

  function startEditing() {
    setDraftName(user.displayName ?? '');
    setEditingName(true);
  }

  async function saveDisplayName() {
    try {
      await updateDisplayName.mutateAsync({ id: user.id, displayName: draftName });
      setEditingName(false);
    } catch {
      // El error se muestra vía updateDisplayName.error
    }
  }

  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        {editingName ? (
          <div className="flex items-center gap-1.5">
            <Input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Alias (vacío = mostrar email)"
              disabled={updateDisplayName.isPending}
              className="h-8 text-sm"
            />
            <IconButton
              aria-label="Guardar alias"
              className="h-8 w-8 shrink-0"
              disabled={updateDisplayName.isPending}
              onClick={() => void saveDisplayName()}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            <IconButton
              aria-label="Cancelar"
              className="h-8 w-8 shrink-0"
              disabled={updateDisplayName.isPending}
              onClick={() => setEditingName(false)}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </div>
        ) : (
          <>
            <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
              <span className="truncate">{user.displayName || user.email || 'Sin email'}</span>
              {isSelf && (
                <Badge tone="brand" className="shrink-0">
                  Tú
                </Badge>
              )}
              <button
                type="button"
                aria-label="Editar alias"
                onClick={startEditing}
                className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </p>
            {user.displayName && user.email && (
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            )}
          </>
        )}
        {error && (
          <span className="block text-xs text-destructive" role="alert">
            {error.message}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {(updateRole.isPending || deleteUser.isPending) && <Spinner />}
        {isSelf ? (
          // No permitimos que un admin se cambie el rol ni se elimine a sí mismo
          // (riesgo de quedarse fuera).
          <Badge tone={user.role === 'admin' ? 'ok' : 'neutral'} className="gap-1">
            {user.role === 'admin' && <ShieldCheck className="h-3 w-3" aria-hidden="true" />}
            {user.role === 'admin' ? 'Admin' : 'Staff'}
          </Badge>
        ) : confirming ? (
          <>
            <span className="text-xs text-muted-foreground">¿Eliminar?</span>
            <Button
              variant="destructive"
              size="sm"
              className="w-auto"
              loading={deleteUser.isPending}
              onClick={() => deleteUser.mutate(user.id, { onError: () => setConfirming(true) })}
            >
              Sí
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-auto"
              disabled={deleteUser.isPending}
              onClick={() => setConfirming(false)}
            >
              No
            </Button>
          </>
        ) : (
          <>
            <RoleSelect
              idPrefix={`role-${user.id}`}
              size="sm"
              value={user.role}
              disabled={updateRole.isPending}
              onChange={(role) => {
                if (role !== user.role) updateRole.mutate({ id: user.id, role });
              }}
            />
            <IconButton
              aria-label={`Eliminar ${user.displayName || user.email || 'usuario'}`}
              className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
              disabled={updateRole.isPending}
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </>
        )}
      </div>
    </li>
  );
}

export function UsersPage() {
  const { user } = useAuth();
  const users = useUsers();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Usuarios"
        subtitle="Crea cuentas y define su rol sin pasar por Supabase."
      />

      <CreateUserForm />

      <section className="space-y-2">
        <h3 className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Usuarios existentes
        </h3>

        {users.isLoading ? (
          <Card className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ) : users.isError ? (
          <EmptyState
            icon={UsersIcon}
            title="No se pudieron cargar los usuarios"
            description={users.error instanceof Error ? users.error.message : 'Inténtalo de nuevo.'}
          />
        ) : (users.data?.length ?? 0) > 0 ? (
          <Card>
            <ul className="divide-y divide-border px-4">
              {users.data!.map((u) => (
                <UserRow key={u.id} user={u} isSelf={u.id === user?.id} />
              ))}
            </ul>
          </Card>
        ) : (
          <EmptyState
            icon={UsersIcon}
            title="Sin usuarios"
            description="Crea el primero con el formulario de arriba."
          />
        )}
      </section>
    </div>
  );
}
