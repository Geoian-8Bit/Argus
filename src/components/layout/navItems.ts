import {
  Home,
  LayoutDashboard,
  Package,
  History,
  Users,
  Truck,
  ClipboardCheck,
  ClipboardPlus,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/features/auth/useRole';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** end: coincidencia exacta de ruta (para "/"). */
  end?: boolean;
}

// Admin: control completo del inventario y las revisiones.
// La gestión de almacenes cuelga de Usuarios (ambas son "quién accede a qué")
// para no meter un sexto ítem en una barra pensada para el pulgar.
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
  { to: '/history', label: 'Historial', icon: History },
  { to: '/dashboard', label: 'Revisiones', icon: ClipboardCheck },
];

// Comercial: registra movimientos a mano (sin escanear) sobre su propio
// almacén y consulta sus ventas. No administra nada.
export const COMERCIAL_NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/movement', label: 'Registrar', icon: ClipboardPlus },
  { to: '/history', label: 'Historial', icon: History },
  { to: '/dashboard', label: 'Ventas', icon: LayoutDashboard },
];

export const NAV_ITEMS_BY_ROLE: Record<Role, NavItem[]> = {
  admin: ADMIN_NAV_ITEMS,
  staff: STAFF_NAV_ITEMS,
  comercial: COMERCIAL_NAV_ITEMS,
};
