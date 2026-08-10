import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export type Role = 'admin' | 'staff' | 'comercial';

export const ROLES: Role[] = ['admin', 'staff', 'comercial'];

function toRole(value: unknown): Role {
  return ROLES.includes(value as Role) ? (value as Role) : 'staff';
}

export function useRole() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile', 'role', user?.id],
    enabled: !!user,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Role> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user!.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      // Rol desconocido o perfil sin crear: se cae al rol con menos permisos.
      return toRole(data?.role);
    },
  });
}
