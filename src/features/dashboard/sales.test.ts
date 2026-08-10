import { describe, expect, it } from 'vitest';
import { summarizeSales, type SaleProduct, type SaleRow } from './sales';

const products: SaleProduct[] = [
  { id: 'contrato-1', price: 100, sale_kind: 'contrato' },
  { id: 'pieza-1', price: 10, sale_kind: 'pieza' },
];

describe('summarizeSales', () => {
  it('parte los ingresos entre contratos y piezas', () => {
    const sales: SaleRow[] = [
      { product_id: 'contrato-1', qty: 2, unit_price: 120 },
      { product_id: 'pieza-1', qty: 3, unit_price: 15 },
    ];

    const summary = summarizeSales(sales, products);

    expect(summary.contractsRevenue).toBe(240);
    expect(summary.piecesRevenue).toBe(45);
    expect(summary.unitsSold).toBe(5);
  });

  it('contratos + piezas suman siempre la venta total', () => {
    const sales: SaleRow[] = [
      { product_id: 'contrato-1', qty: 1, unit_price: 100 },
      { product_id: 'pieza-1', qty: 4, unit_price: 12.5 },
    ];

    const summary = summarizeSales(sales, products);

    expect(summary.contractsRevenue + summary.piecesRevenue).toBe(summary.revenue);
  });

  it('calcula la diferencia frente al precio base', () => {
    const sales: SaleRow[] = [{ product_id: 'pieza-1', qty: 2, unit_price: 15 }];

    const summary = summarizeSales(sales, products);

    expect(summary.baseTotal).toBe(20);
    expect(summary.diff).toBe(10);
  });

  it('cuenta como pieza el producto que ya no existe, sin romper el total', () => {
    const sales: SaleRow[] = [{ product_id: 'borrado', qty: 1, unit_price: 30 }];

    const summary = summarizeSales(sales, products);

    expect(summary.piecesRevenue).toBe(30);
    expect(summary.revenue).toBe(30);
    expect(summary.baseTotal).toBe(0);
  });

  it('acepta los numeric que llegan como texto desde Postgres', () => {
    const sales: SaleRow[] = [{ product_id: 'contrato-1', qty: 2, unit_price: '99.50' }];

    const summary = summarizeSales(sales, [
      { id: 'contrato-1', price: '100.00', sale_kind: 'contrato' },
    ]);

    expect(summary.contractsRevenue).toBe(199);
    expect(summary.baseTotal).toBe(200);
  });

  it('sin ventas devuelve todo a cero', () => {
    const summary = summarizeSales([], products);

    expect(summary).toEqual({
      unitsSold: 0,
      revenue: 0,
      contractsRevenue: 0,
      piecesRevenue: 0,
      baseTotal: 0,
      diff: 0,
    });
  });
});
