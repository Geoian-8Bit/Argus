// Registro de temas. Única fuente de verdad: para dejar fijo el tema ganador
// y quitar el selector, basta con recortar este array y borrar ThemeSwitcher.

export type ThemeId = 'claro' | 'control' | 'suave';

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  description: string;
  /** Color para <meta name="theme-color"> (barra del navegador / PWA). */
  themeColor: string;
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'claro',
    label: 'Almacén claro',
    description: 'Claro y nítido',
    themeColor: '#fbfcfe',
  },
  {
    id: 'control',
    label: 'Sala de control',
    description: 'Oscuro, poca luz',
    themeColor: '#0c1019',
  },
  {
    id: 'suave',
    label: 'Suave',
    description: 'Cálido y cercano',
    themeColor: '#f8f4ec',
  },
];

export const DEFAULT_THEME: ThemeId = 'claro';
export const THEME_STORAGE_KEY = 'argus-theme';

export function isThemeId(value: unknown): value is ThemeId {
  return value === 'claro' || value === 'control' || value === 'suave';
}
