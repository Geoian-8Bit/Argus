import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export type Role = 'admin' | 'staff';

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
      return data?.role === 'admin' ? 'admin' : 'staff';
    },
  });
}
