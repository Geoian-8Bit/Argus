import { describe, expect, it } from 'vitest';
import { pickWarehouse } from './pickWarehouse';
import type { Warehouse } from './useWarehouses';

function warehouse(id: string, name: string): Warehouse {
  return { id, name, position: 0, created_at: '2026-01-01T00:00:00Z', archived_at: null };
}

const principal = warehouse('w1', 'Almacén principal');
const marta = warehouse('w2', 'Furgoneta de Marta');

describe('pickWarehouse', () => {
  it('devuelve el almacén guardado cuando sigue disponible', () => {
    expect(pickWarehouse([principal, marta], 'w2')).toBe(marta);
  });

  it('cae al primero si el guardado ya no está accesible', () => {
    expect(pickWarehouse([principal], 'w2')).toBe(principal);
  });

  it('cae al primero cuando no hay nada guardado', () => {
    expect(pickWarehouse([principal, marta], null)).toBe(principal);
  });

  it('devuelve null si el usuario no accede a ningún almacén', () => {
    expect(pickWarehouse([], 'w1')).toBeNull();
  });
});
