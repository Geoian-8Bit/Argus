import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Elimina un usuario (auth.users → cascada a profiles).
// Requiere service_role, por eso vive en una Edge Function. Solo admins.
// Salvaguardas: no puedes eliminarte a ti mismo ni dejar el sistema sin admins.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authHeader = req.headers.get('Authorization') ?? '';

  if (!url || !anonKey || !serviceKey) {
    return json({ error: 'Configuración del servidor incompleta' }, 500);
  }
  if (!authHeader) return json({ error: 'Falta autenticación' }, 401);

  // Cliente con el token del llamante: verifica identidad y rol vía is_admin().
  const caller = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error: userErr,
  } = await caller.auth.getUser();
  if (userErr || !user) return json({ error: 'Sesión no válida' }, 401);

  const { data: isAdmin, error: roleErr } = await caller.rpc('is_admin');
  if (roleErr) return json({ error: roleErr.message }, 500);
  if (!isAdmin) return json({ error: 'Solo los administradores pueden eliminar usuarios' }, 403);

  let body: { id?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  const id = String(body.id ?? '').trim();
  if (!id) return json({ error: 'Falta el identificador del usuario' }, 400);
  if (id === user.id) return json({ error: 'No puedes eliminar tu propia cuenta' }, 400);

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // No dejar el sistema sin administradores.
  const { data: target, error: targetErr } = await admin
    .from('profiles')
    .select('role')
    .eq('id', id)
    .maybeSingle();
  if (targetErr) return json({ error: targetErr.message }, 500);
  if (!target) return json({ error: 'El usuario no existe' }, 404);

  if (target.role === 'admin') {
    const { count, error: countErr } = await admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin');
    if (countErr) return json({ error: countErr.message }, 500);
    if ((count ?? 0) <= 1) {
      return json({ error: 'No puedes eliminar al último administrador' }, 409);
    }
  }

  const { error: deleteErr } = await admin.auth.admin.deleteUser(id);
  if (deleteErr) return json({ error: deleteErr.message }, 400);

  return json({ id }, 200);
});
