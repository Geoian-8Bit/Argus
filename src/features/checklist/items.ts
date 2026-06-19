// Catálogo fijo de la ficha "Material en furgoneta". Los IDs son estables: se
// guardan en van_checklists.items y no deben cambiar (las etiquetas sí se pueden
// retocar). Para añadir/quitar material, edita estas listas.

export interface ChecklistItem {
  id: string;
  label: string;
}

export interface ChecklistCategory {
  id: string;
  label: string;
  items: ChecklistItem[];
}

export const CHECKLIST: ChecklistCategory[] = [
  {
    id: 'papeleria',
    label: 'Papelería',
    items: [
      { id: 'grapadora', label: 'Grapadora' },
      { id: 'grapas', label: 'Grapas' },
      { id: 'tipex', label: 'Típex' },
      { id: 'boligrafo', label: 'Bolígrafo' },
      { id: 'tpv', label: 'TPV' },
      { id: 'cargador_tpv', label: 'Cargador TPV' },
      { id: 'rollo_papel_tpv', label: 'Rollo papel TPV' },
      { id: 'hojas_reclamaciones', label: 'Hojas de reclamaciones' },
      { id: 'hojas_traslados', label: 'Hojas traslados' },
      { id: 'contratos_pedidos', label: 'Contratos para pedidos' },
      { id: 'recibos_pago', label: 'Recibos de pago' },
      { id: 'sello_pagado', label: 'Sello de pagado' },
    ],
  },
  {
    id: 'herramientas',
    label: 'Herramientas',
    items: [
      { id: 'taladro_complementos', label: 'Taladro + complementos' },
      { id: 'llaves_allen', label: 'Llaves allen' },
      { id: 'llaves_fijas_carracas', label: 'Llaves fijas / carracas' },
      { id: 'cuter', label: 'Cúter' },
      { id: 'metro', label: 'Metro' },
      { id: 'radial', label: 'Radial' },
      { id: 'discos_radial', label: 'Discos para radial' },
      { id: 'aceite_multiusos', label: 'Aceite multiusos' },
      { id: 'bridas', label: 'Bridas' },
      { id: 'guantes', label: 'Guantes' },
      { id: 'tornilleria', label: 'Tornillería' },
      { id: 'cuerdas', label: 'Cuerdas' },
    ],
  },
  {
    id: 'repuestos',
    label: 'Repuestos',
    items: [
      { id: 'motor_somier', label: 'Motor de somier' },
      { id: 'mando_somier', label: 'Mando de somier' },
      { id: 'cable_y', label: '2 cable "Y"' },
      { id: 'pletinas_union', label: 'Varias pletinas de unión' },
      { id: 'asas_sujeta_colchon', label: 'Asas sujeta colchón' },
      { id: 'patas_15', label: '16 patas de 15 cm' },
      { id: 'patas_20', label: '16 patas de 20 cm' },
      { id: 'patas_30', label: '16 patas de 30 cm' },
      { id: 'compases_canape', label: 'Compases de canapé' },
      { id: 'hidraulicos_canape', label: 'Hidráulicos de canapé' },
    ],
  },
  {
    id: 'otros',
    label: 'Otros',
    items: [
      { id: 'sal', label: 'Sal' },
      { id: 'saquitos', label: 'Saquitos' },
      { id: 'bolas_topper', label: 'Bolas topper' },
      { id: 'rollo_film', label: 'Rollo de film' },
      { id: 'rollo_celo', label: 'Rollo de celo' },
      { id: 'bolsa_plastico_colchon', label: 'Bolsa plástico colchón' },
    ],
  },
];

export const CHECKLIST_ITEMS: ChecklistItem[] = CHECKLIST.flatMap((c) => c.items);

export const CHECKLIST_LABELS: Record<string, string> = Object.fromEntries(
  CHECKLIST_ITEMS.map((i) => [i.id, i.label]),
);

export const CHECKLIST_TOTAL = CHECKLIST_ITEMS.length;

export type ChecklistState = Record<string, boolean>;

/** Estado inicial: todo presente (Sí); el repartidor desmarca lo que falte. */
export function defaultChecklistState(): ChecklistState {
  return Object.fromEntries(CHECKLIST_ITEMS.map((i) => [i.id, true]));
}

/** IDs marcados como ausentes (false) en un estado guardado. */
export function missingItemIds(items: ChecklistState): string[] {
  return CHECKLIST_ITEMS.filter((i) => items[i.id] === false).map((i) => i.id);
}
