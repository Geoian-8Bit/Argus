import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Role } from '@/features/auth/useRole';

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

// Las funciones Edge devuelven el error en el cuerpo de la respuesta; supabase-js
// lo envuelve en FunctionsHttpError y guarda la Response en `context`.
async function functionErrorMessage(error: unknown): Promise<string> {
  const ctx = (error as { context?: Response } | null)?.context;
  if (ctx && typeof ctx.json === 'function') {
    try {
      const body = (await ctx.json()) as { error?: string };
      if (body?.error) return body.error;
    } catch {
      // Sin cuerpo JSON: caemos al mensaje genérico.
    }
  }
  return error instanceof Error ? error.message : 'No se pudo crear el usuario.';
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
      if (error) throw new Error(await functionErrorMessage(error));
      if (!data) throw new Error('Respuesta vacía del servidor.');
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
