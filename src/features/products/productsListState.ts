// Estado de UI del listado de productos, persistido en sessionStorage para que
// al volver del detalle se conserven la búsqueda, los grupos abiertos y el scroll.

export type ProductsView = 'groups' | 'products';

export interface ProductsListState {
  view: ProductsView;
  search: string;
  expanded: string[];
  scrollY: number;
}

const STORAGE_KEY = 'argus:products-list-state';

const DEFAULT_STATE: ProductsListState = { view: 'groups', search: '', expanded: [], scrollY: 0 };

export function loadProductsListState(): ProductsListState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<ProductsListState>;
    return {
      view: parsed.view === 'products' ? 'products' : 'groups',
      search: typeof parsed.search === 'string' ? parsed.search : '',
      expanded: Array.isArray(parsed.expanded)
        ? parsed.expanded.filter((k): k is string => typeof k === 'string')
        : [],
      scrollY: typeof parsed.scrollY === 'number' ? parsed.scrollY : 0,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveProductsListState(state: ProductsListState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Sin sessionStorage (modo privado antiguo, etc.) simplemente no se persiste.
  }
}
