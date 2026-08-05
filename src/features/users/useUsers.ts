import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Role } from '@/features/auth/useRole';

export interface UserProfile {
  id: string;
  email: string | null;
  /** Alias visible en vez del email en listados y menús. Opcional. */
  displayName: string | null;
  role: Role;
  created_at: string;
}

// Lista todos los perfiles. Solo devuelve datos a un admin (RLS).
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserProfile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, role, created_at')
        .order('created_at', { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []).map((p) => ({
        id: p.id,
        email: p.email,
        displayName: p.display_name,
        role: p.role === 'admin' ? 'admin' : 'staff',
        created_at: p.created_at,
      }));
    },
  });
}
