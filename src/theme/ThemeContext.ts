import { createContext } from 'react';
import type { ThemeId, ThemeMeta } from './themes';

export interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeMeta[];
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
