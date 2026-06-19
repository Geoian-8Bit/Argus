import { Home, LayoutDashboard, Package, History, Users, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** end: coincidencia exacta de ruta (para "/"). */
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { to: '/products', label: 'Productos', icon: Package },
  { to: '/history', label: 'Historial', icon: History },
  { to: '/users', label: 'Usuarios', icon: Users },
];
