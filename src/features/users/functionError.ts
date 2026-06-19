// Las funciones Edge devuelven el error en el cuerpo de la respuesta; supabase-js
// lo envuelve en FunctionsHttpError y guarda la Response en `context`. Extraemos
// el mensaje útil (`{ error }`) y, si no lo hay, caemos a un texto por defecto.
export async function functionErrorMessage(error: unknown, fallback: string): Promise<string> {
  const ctx = (error as { context?: Response } | null)?.context;
  if (ctx && typeof ctx.json === 'function') {
    try {
      const body = (await ctx.json()) as { error?: string };
      if (body?.error) return body.error;
    } catch {
      // Sin cuerpo JSON: caemos al mensaje genérico.
    }
  }
  return error instanceof Error ? error.message : fallback;
}
