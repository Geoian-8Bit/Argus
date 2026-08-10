// Cálculo puro de las ventas de un periodo. Vive aparte de useSales para que
// los tests no arrastren el cliente de Supabase (que exige las VITE_SUPABASE_*
// y no existen en CI).

export interface SalesSummary {
  /** Unidades vendidas (salidas con precio registrado) en el periodo. */
  unitsSold: number;
  /** Ingresos: Σ precio_venta × cantidad. Es la "venta total". */
  revenue: number;
  /** Parte de los ingresos que viene de artículos de tipo contrato. */
  contractsRevenue: number;
  /** Parte de los ingresos que viene de artículos de tipo pieza. */
  piecesRevenue: number;
  /** Valor a precio base de lo vendido: Σ precio_base × cantidad. */
  baseTotal: number;
  /** Diferencia sobre el precio base: ingresos − baseTotal. */
  diff: number;
}

export interface SaleRow {
  qty: number | null;
  /** numeric de Postgres: puede llegar como texto. */
  unit_price: number | string | null;
  product_id: string;
}

export interface SaleProduct {
  id: string;
  price: number | string | null;
  sale_kind: 'contrato' | 'pieza';
}

/**
 * Agrega las salidas de un periodo. El reparto contratos/piezas sale del tipo
 * del artículo, así que los dos siempre suman la venta total.
 */
export function summarizeSales(sales: SaleRow[], products: SaleProduct[]): SalesSummary {
  const byId = new Map(
    products.map((p) => [p.id, { price: Number(p.price) || 0, kind: p.sale_kind }]),
  );

  let unitsSold = 0;
  let revenue = 0;
  let contractsRevenue = 0;
  let piecesRevenue = 0;
  let baseTotal = 0;
  for (const m of sales) {
    const qty = m.qty ?? 0;
    const amount = (Number(m.unit_price) || 0) * qty;
    const product = byId.get(m.product_id);
    unitsSold += qty;
    revenue += amount;
    baseTotal += (product?.price ?? 0) * qty;
    if (product?.kind === 'contrato') contractsRevenue += amount;
    else piecesRevenue += amount;
  }

  return {
    unitsSold,
    revenue,
    contractsRevenue,
    piecesRevenue,
    baseTotal,
    diff: revenue - baseTotal,
  };
}
