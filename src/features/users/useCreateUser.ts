import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Role } from '@/features/auth/useRole';
import { functionErrorMessage } from './functionError';

export interface CreateUserInput {
  email: string;
  password: string;
  role: Role;
}

export interface CreatedUser {
  id: string;
  email: string;
  role: Role;
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserInput): Promise<CreatedUser> => {
      const { data, error } = await supabase.functions.invoke<CreatedUser>('admin-create-user', {
        body: {
          email: input.email.trim().toLowerCase(),
          password: input.password,
          role: input.role,
        },
      });
      if (error) throw new Error(await functionErrorMessage(error, 'No se pudo crear el usuario.'));
      if (!data) throw new Error('Respuesta vacía del servidor.');
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
