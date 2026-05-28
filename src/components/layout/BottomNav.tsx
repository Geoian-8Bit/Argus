import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/scan', label: 'Escanear' },
  { to: '/products', label: 'Productos' },
  { to: '/history', label: 'Historial' },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-background">
      <ul className="mx-auto flex max-w-md items-center justify-around">
        {links.map((link) => (
          <li key={link.to} className="flex-1">
            <NavLink
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'block py-3 text-center text-sm transition-colors',
                  isActive ? 'font-medium text-primary' : 'text-muted-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
