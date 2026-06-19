import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Crea un usuario (email + contraseña) y le asigna un rol.
// Requiere service_role para usar la Admin API, por eso vive en una Edge Function
// y no en el cliente. Solo los administradores autenticados pueden invocarla.

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

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

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

  // Cliente con el token del llamante: verifica identidad y rol vía RLS/is_admin().
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
  if (!isAdmin) return json({ error: 'Solo los administradores pueden crear usuarios' }, 403);

  let body: { email?: unknown; password?: unknown; role?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  const email = String(body.email ?? '')
    .trim()
    .toLowerCase();
  const password = String(body.password ?? '');
  const role = body.role === 'admin' ? 'admin' : 'staff';

  if (!EMAIL_RE.test(email)) return json({ error: 'Email no válido' }, 400);
  if (password.length < 8) {
    return json({ error: 'La contraseña debe tener al menos 8 caracteres' }, 400);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // El admin define la contraseña; entra sin confirmar email.
  });
  if (createErr || !created?.user) {
    const msg = createErr?.message ?? 'No se pudo crear el usuario';
    if (/already|exist|registered/i.test(msg)) {
      return json({ error: `Ya existe un usuario con el email ${email}` }, 409);
    }
    return json({ error: msg }, 400);
  }

  // El trigger handle_new_user ya creó el perfil como "staff"; fijamos el rol elegido.
  const { error: profileErr } = await admin
    .from('profiles')
    .update({ role, email })
    .eq('id', created.user.id);
  if (profileErr) {
    // Revertir: no dejamos un usuario huérfano si no se pudo asignar el rol.
    await admin.auth.admin.deleteUser(created.user.id);
    return json({ error: `No se pudo asignar el rol: ${profileErr.message}` }, 500);
  }

  return json({ id: created.user.id, email, role }, 201);
});
