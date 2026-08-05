import { describe, expect, it } from 'vitest';
import { DEFAULT_MIN_STOCK, INACTIVE_STOCK, stockStatus } from './constants';

describe('stockStatus', () => {
  it('marca como inactivo el sentinela de producto desactivado', () => {
    expect(stockStatus(INACTIVE_STOCK)).toBe('inactive');
    expect(stockStatus(INACTIVE_STOCK, 10)).toBe('inactive');
  });

  it('distingue agotado, bajo umbral y correcto', () => {
    expect(stockStatus(0, 5)).toBe('out');
    expect(stockStatus(1, 5)).toBe('low');
    expect(stockStatus(5, 5)).toBe('low');
    expect(stockStatus(6, 5)).toBe('ok');
  });

  it('usa el umbral por defecto cuando el producto no tiene el suyo', () => {
    expect(stockStatus(DEFAULT_MIN_STOCK)).toBe('low');
    expect(stockStatus(DEFAULT_MIN_STOCK + 1)).toBe('ok');
  });
});
