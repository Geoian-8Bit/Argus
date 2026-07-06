import { supabase } from '@/lib/supabase';
import { generateProductsQrPdf, type QrPdfProgress } from '@/lib/qrPdf';

/**
 * Genera y descarga un PDF con el QR de los códigos indicados (los productos que
 * el usuario haya seleccionado). Devuelve cuántos se exportaron.
 * `onProgress` permite mostrar una barra de progreso durante la generación.
 */
export async function downloadProductsQrPdf(
  codes: string[],
  onProgress?: (progress: QrPdfProgress) => void,
): Promise<number> {
  const items = codes.map((code) => ({ code: code.trim() })).filter((p) => p.code.length > 0);
  if (items.length === 0) {
    throw new Error('No hay productos seleccionados para exportar.');
  }

  await generateProductsQrPdf(items, { onProgress });
  return items.length;
}

/**
 * Genera y descarga un PDF con el QR de todos los productos activos
 * (no archivados), ordenados por código. Devuelve cuántos se exportaron.
 * `onProgress` permite mostrar una barra de progreso durante la generación.
 */
export async function downloadAllProductsQrPdf(
  onProgress?: (progress: QrPdfProgress) => void,
): Promise<number> {
  const { data, error } = await supabase
    .from('products')
    .select('code')
    .is('archived_at', null)
    .order('code', { ascending: true });
  if (error) throw new Error(error.message);

  const codes = (data ?? []).map((p) => p.code);
  return downloadProductsQrPdf(codes, onProgress);
}
