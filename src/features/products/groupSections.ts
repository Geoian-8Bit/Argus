// Reparto de productos en secciones por grupo. Cálculo puro, sin React ni
// Supabase: lo comparten el listado de Productos (con arrastre) y el selector de
// Registrar movimiento (solo lectura), para que los dos ordenen igual.

/** Clave del pseudogrupo que reúne los productos sin grupo asignado. */
export const UNGROUPED = 'ungrouped';

export interface GroupSectionOf<P, G> {
  key: string;
  name: string;
  /** Grupo real (ausente en "Sin grupo"), para poder editarlo y arrastrarlo. */
  group?: G;
  products: P[];
}

export interface BuildGroupSectionsOptions {
  /**
   * Incluir los grupos sin productos. Al navegar interesa verlos (se pueden
   * editar); al buscar solo estorban.
   */
  includeEmpty?: boolean;
}

/**
 * Agrupa los productos respetando el orden manual de los grupos (el del array
 * `groups`) y el de los productos dentro de cada grupo (el del array
 * `products`). "Sin grupo" siempre va al final.
 */
export function buildGroupSections<
  P extends { group_id: string | null },
  G extends { id: string; name: string },
>(
  products: P[],
  groups: G[],
  { includeEmpty = true }: BuildGroupSectionsOptions = {},
): GroupSectionOf<P, G>[] {
  const byGroup = new Map<string, P[]>();
  for (const p of products) {
    const key = p.group_id ?? UNGROUPED;
    const bucket = byGroup.get(key);
    if (bucket) bucket.push(p);
    else byGroup.set(key, [p]);
  }

  const known = new Set(groups.map((g) => g.id));
  const sections: GroupSectionOf<P, G>[] = groups
    .filter((g) => includeEmpty || byGroup.has(g.id))
    .map((g) => ({ key: g.id, name: g.name, group: g, products: byGroup.get(g.id) ?? [] }));

  // Los productos sin grupo (o con un grupo ya inexistente) van al final.
  const ungrouped = [...(byGroup.get(UNGROUPED) ?? [])];
  for (const [key, prods] of byGroup) {
    if (key !== UNGROUPED && !known.has(key)) ungrouped.push(...prods);
  }
  if (ungrouped.length > 0) {
    sections.push({ key: UNGROUPED, name: 'Sin grupo', products: ungrouped });
  }

  return sections;
}
