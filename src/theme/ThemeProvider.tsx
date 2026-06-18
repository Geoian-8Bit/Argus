import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext, type ThemeContextValue } from './ThemeContext';
import { DEFAULT_THEME, THEMES, THEME_STORAGE_KEY, isThemeId, type ThemeId } from './themes';

function applyTheme(theme: ThemeId) {
  const el = document.documentElement;
  el.setAttribute('data-theme', theme);
  // El tema oscuro también activa `.dark` para coherencia de controles nativos.
  el.classList.toggle('dark', theme === 'control');
  const color = THEMES.find((t) => t.id === theme)?.themeColor;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && color) meta.setAttribute('content', color);
}

function readInitialTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeId(stored)) return stored;
  } catch {
    /* localStorage no disponible */
  }
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(readInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* localStorage no disponible */
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, themes: THEMES }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
