import {
  Home,
  LayoutDashboard,
  Package,
  History,
  Users,
  Truck,
  ClipboardCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** end: coincidencia exacta de ruta (para "/"). */
  end?: boolean;
}

// Admin: control completo del inventario y las revisiones.
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { to: '/products', label: 'Productos', icon: Package },
  { to: '/history', label: 'Historial', icon: History },
  { to: '/users', label: 'Usuarios', icon: Users },
];

// Staff (repartidores): escanear, rellenar la ficha de furgoneta y ver sus revisiones.
export const STAFF_NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/checklist', label: 'Furgoneta', icon: Truck },
  { to: '/dashboard', label: 'Revisiones', icon: ClipboardCheck },
];
