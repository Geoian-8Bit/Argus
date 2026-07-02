import { supabase } from '@/lib/supabase';
import { generateProductsQrPdf } from '@/lib/qrPdf';

/**
 * Genera y descarga un PDF con el QR de todos los productos activos
 * (no archivados), ordenados por código. Devuelve cuántos se exportaron.
 */
export async function downloadAllProductsQrPdf(): Promise<number> {
  const { data, error } = await supabase
    .from('products')
    .select('code')
    .is('archived_at', null)
    .order('code', { ascending: true });
  if (error) throw new Error(error.message);

  const items = (data ?? []).map((p) => ({ code: p.code })).filter((p) => p.code.trim().length > 0);
  if (items.length === 0) {
    throw new Error('No hay productos activos para exportar.');
  }

  await generateProductsQrPdf(items);
  return items.length;
}
