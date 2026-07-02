import { describe, expect, it } from 'vitest';
import { gridSlot, QR_GRID_8 } from './qrPdf';

describe('gridSlot', () => {
  const { columns, rows } = QR_GRID_8; // 4 columnas × 2 filas = 8 por página

  it('coloca los elementos por filas dentro de la primera página', () => {
    expect(gridSlot(0, columns, rows)).toEqual({ page: 0, col: 0, row: 0 });
    expect(gridSlot(3, columns, rows)).toEqual({ page: 0, col: 3, row: 0 });
    expect(gridSlot(4, columns, rows)).toEqual({ page: 0, col: 0, row: 1 });
    expect(gridSlot(7, columns, rows)).toEqual({ page: 0, col: 3, row: 1 });
  });

  it('pasa a la página siguiente al superar la capacidad', () => {
    expect(gridSlot(8, columns, rows)).toEqual({ page: 1, col: 0, row: 0 });
    expect(gridSlot(15, columns, rows)).toEqual({ page: 1, col: 3, row: 1 });
    expect(gridSlot(16, columns, rows)).toEqual({ page: 2, col: 0, row: 0 });
  });
});
