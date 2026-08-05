import { describe, expect, it } from 'vitest';
import { arrayMove } from '@dnd-kit/sortable';
import { ascendingPositions, changedPositions } from './reorder';

describe('ascendingPositions', () => {
  it('devuelve las positions del conjunto ordenadas de menor a mayor', () => {
    expect(ascendingPositions([{ position: 7 }, { position: 2 }, { position: 5 }])).toEqual([
      2, 5, 7,
    ]);
  });

  it('separa las repetidas para que el orden guardado no sea ambiguo', () => {
    expect(ascendingPositions([{ position: 3 }, { position: 3 }, { position: 3 }])).toEqual([
      3, 4, 5,
    ]);
  });

  it('usa el índice cuando falta la position', () => {
    expect(ascendingPositions([{ position: null }, { position: null }])).toEqual([0, 1]);
  });
});

describe('changedPositions', () => {
  const ids = ['a', 'b', 'c', 'd', 'e'];
  const positions = [10, 11, 12, 13, 14];

  it('solo guarda las filas que de verdad cambian de sitio', () => {
    // Mover "a" al hueco de "c" desplaza a "b" y "c"; "d" y "e" no se mueven.
    const moved = arrayMove(ids, 0, 2);
    expect(changedPositions(ids, moved, positions)).toEqual([
      { id: 'b', position: 10 },
      { id: 'c', position: 11 },
      { id: 'a', position: 12 },
    ]);
  });

  it('no guarda nada si el orden no cambia', () => {
    expect(changedPositions(ids, [...ids], positions)).toEqual([]);
  });

  it('deja fuera el tramo intacto en una lista larga', () => {
    // El bug que arregla: con 520 productos se reasignaban los 520.
    const many = Array.from({ length: 520 }, (_, i) => `p${i}`);
    const manyPositions = many.map((_, i) => i);
    const moved = arrayMove(many, 0, 3);
    const updates = changedPositions(many, moved, manyPositions);
    expect(updates).toHaveLength(4);
    expect(updates.map((u) => u.id)).toEqual(['p1', 'p2', 'p3', 'p0']);
  });
});
