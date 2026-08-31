import { describe, expect, it } from 'vitest';
import { buildGroupSections, UNGROUPED } from './groupSections';

const groups = [
  { id: 'g1', name: 'Filtros' },
  { id: 'g2', name: 'Aceites' },
];

const products = [
  { id: 'p1', group_id: 'g2' },
  { id: 'p2', group_id: null },
  { id: 'p3', group_id: 'g1' },
  { id: 'p4', group_id: 'g2' },
];

describe('buildGroupSections', () => {
  it('respeta el orden de los grupos y mete cada producto en el suyo', () => {
    const sections = buildGroupSections(products, groups);
    expect(sections.map((s) => s.key)).toEqual(['g1', 'g2', UNGROUPED]);
    expect(sections[0].products.map((p) => p.id)).toEqual(['p3']);
    expect(sections[1].products.map((p) => p.id)).toEqual(['p1', 'p4']);
  });

  it('deja "Sin grupo" al final y solo si tiene productos', () => {
    const sections = buildGroupSections(
      products.filter((p) => p.group_id),
      groups,
    );
    expect(sections.map((s) => s.key)).toEqual(['g1', 'g2']);
  });

  it('incluye los grupos vacíos por defecto y los omite con includeEmpty: false', () => {
    const onlyG1 = [{ id: 'p3', group_id: 'g1' }];
    expect(buildGroupSections(onlyG1, groups).map((s) => s.key)).toEqual(['g1', 'g2']);
    expect(buildGroupSections(onlyG1, groups, { includeEmpty: false }).map((s) => s.key)).toEqual([
      'g1',
    ]);
  });

  it('manda a "Sin grupo" los productos de un grupo que ya no existe', () => {
    const sections = buildGroupSections([{ id: 'p9', group_id: 'borrado' }], groups);
    const ungrouped = sections.find((s) => s.key === UNGROUPED);
    expect(ungrouped?.products.map((p) => p.id)).toEqual(['p9']);
  });

  it('no devuelve nada cuando no hay productos ni grupos', () => {
    expect(buildGroupSections([], [])).toEqual([]);
  });
});
