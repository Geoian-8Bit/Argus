import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { functionErrorMessage } from './functionError';

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.functions.invoke('admin-delete-user', { body: { id } });
      if (error)
        throw new Error(await functionErrorMessage(error, 'No se pudo eliminar el usuario.'));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
