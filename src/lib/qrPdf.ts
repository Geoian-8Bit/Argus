import { generateQrDataUrl } from './qr';

export interface QrPdfItem {
  /** Texto que codifica el QR y que se imprime debajo (el código del producto). */
  code: string;
}

export interface QrGridLayout {
  orientation: 'portrait' | 'landscape';
  columns: number;
  rows: number;
  /** Margen exterior de la página, en mm. */
  margin: number;
}

/** 8 QR por página (A4 horizontal, 4×2), como la hoja de etiquetas de referencia. */
export const QR_GRID_8: QrGridLayout = {
  orientation: 'landscape',
  columns: 4,
  rows: 2,
  margin: 12,
};

export interface GridSlot {
  page: number;
  col: number;
  row: number;
}

/** Posición (página, columna, fila) del elemento `index` en una rejilla de columns×rows. */
export function gridSlot(index: number, columns: number, rows: number): GridSlot {
  const perPage = columns * rows;
  const posInPage = index % perPage;
  return {
    page: Math.floor(index / perPage),
    col: posInPage % columns,
    row: Math.floor(posInPage / columns),
  };
}

const QR_PX = 512; // resolución del PNG del QR (nítido al imprimir a ~55 mm)
const LABEL_GAP = 5; // mm entre el QR y el código
const LABEL_HEIGHT = 4; // mm reservados para el texto del código
const QR_FILL = 0.82; // proporción del ancho de celda que ocupa el QR

/**
 * Genera un PDF A4 con el QR de cada elemento en rejilla (paginando solo) y lo
 * descarga. Debajo de cada QR se imprime su código, como en la hoja de etiquetas.
 * jsPDF se carga de forma diferida para no engordar el bundle inicial.
 */
export async function generateProductsQrPdf(
  items: QrPdfItem[],
  layout: QrGridLayout = QR_GRID_8,
  filename = 'qr-productos.pdf',
): Promise<void> {
  if (items.length === 0) return;

  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: layout.orientation, unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const cellW = (pageW - layout.margin * 2) / layout.columns;
  const cellH = (pageH - layout.margin * 2) / layout.rows;
  // El QR es cuadrado y debe caber en la celda dejando hueco para el código.
  const qrSize = Math.min(cellW, cellH - LABEL_GAP - LABEL_HEIGHT) * QR_FILL;
  const blockH = qrSize + LABEL_GAP + LABEL_HEIGHT;

  // Pre-generamos todos los QR en paralelo antes de componer el documento.
  const qrImages = await Promise.all(items.map((it) => generateQrDataUrl(it.code, QR_PX)));

  doc.setFont('courier', 'bold');
  doc.setFontSize(11);

  items.forEach((it, i) => {
    const { page, col, row } = gridSlot(i, layout.columns, layout.rows);
    if (page > 0 && col === 0 && row === 0) doc.addPage();

    const cellX = layout.margin + col * cellW;
    const cellY = layout.margin + row * cellH;
    // Bloque QR + código centrado dentro de la celda.
    const qrX = cellX + (cellW - qrSize) / 2;
    const qrY = cellY + (cellH - blockH) / 2;

    doc.addImage(qrImages[i], 'PNG', qrX, qrY, qrSize, qrSize);
    doc.text(it.code, cellX + cellW / 2, qrY + qrSize + LABEL_GAP, {
      align: 'center',
      baseline: 'top',
    });
  });

  doc.save(filename);
}
