import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Cambia el alias mostrado de un usuario. Igual que el rol, la política RLS
// "profiles: admin update" exige is_admin(); no requiere Edge Function porque
// no toca auth.users, solo la tabla profiles.
export function useUpdateUserDisplayName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, displayName }: { id: string; displayName: string | null }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName?.trim() || null })
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
