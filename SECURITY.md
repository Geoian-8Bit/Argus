# Seguridad

## Reportar vulnerabilidades

Si encuentras una vulnerabilidad en este proyecto, **no abras un issue público**. Escribe a la dirección de contacto del repositorio con:

- Descripción del problema.
- Pasos para reproducirlo.
- Impacto estimado.

Se responderá lo antes posible.

## Buenas prácticas en este repo

- Nunca commitear archivos `.env*` (`.env.example` es la única excepción).
- La `anon key` de Supabase puede vivir en el cliente, pero la `service_role` **nunca**.
- Las políticas RLS de Supabase son la línea de defensa principal. Cualquier nueva tabla debe llevar RLS habilitada antes de exponerse.
- Mantener dependencias al día (`npm audit` se ejecuta en CI).
