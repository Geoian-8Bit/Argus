import { Sun, Moon, Leaf, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from './useTheme';
import type { ThemeId } from './themes';

// Selector TEMPORAL para que el usuario pruebe los temas y elija el ganador.
// Cuando se decida, se borra este componente y sus usos.

const ICONS: Record<ThemeId, LucideIcon> = {
  claro: Sun,
  control: Moon,
  suave: Leaf,
};

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Tema visual"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5 shadow-sm',
        className,
      )}
    >
      {themes.map((t) => {
        const Icon = ICONS[t.id];
        const active = t.id === theme;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={t.label}
            title={t.label}
            onClick={() => setTheme(t.id)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'bg-brand text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
