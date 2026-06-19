export type Granularity = 'week' | 'month' | 'quarter' | 'year';

export interface Period {
  /** Inicio del periodo (inclusivo). */
  start: Date;
  /** Fin del periodo (exclusivo). */
  end: Date;
  /** Etiqueta legible: "Junio 2026", "T2 2026", "2–8 jun", "2026". */
  label: string;
}

export const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Año' },
];

const dayMonthFmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' });
const monthYearFmt = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' });

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Calcula el rango de un periodo relativo a hoy. offset 0 = actual, -1 = anterior, etc.
export function periodRange(granularity: Granularity, offset: number): Period {
  const now = new Date();

  if (granularity === 'week') {
    const base = startOfDay(now);
    const dayFromMonday = (base.getDay() + 6) % 7; // 0 = lunes
    const start = new Date(base);
    start.setDate(base.getDate() - dayFromMonday + offset * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const lastDay = new Date(end);
    lastDay.setDate(end.getDate() - 1);
    return { start, end, label: `${dayMonthFmt.format(start)} – ${dayMonthFmt.format(lastDay)}` };
  }

  if (granularity === 'month') {
    // El constructor de Date normaliza el desbordamiento de meses (años incluidos).
    const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
    return { start, end, label: capitalize(monthYearFmt.format(start)) };
  }

  if (granularity === 'quarter') {
    const quarter = Math.floor(now.getMonth() / 3) + offset;
    const start = new Date(now.getFullYear(), quarter * 3, 1);
    const end = new Date(now.getFullYear(), quarter * 3 + 3, 1);
    const quarterNumber = Math.floor(start.getMonth() / 3) + 1;
    return { start, end, label: `T${quarterNumber} ${start.getFullYear()}` };
  }

  // year
  const start = new Date(now.getFullYear() + offset, 0, 1);
  const end = new Date(now.getFullYear() + offset + 1, 0, 1);
  return { start, end, label: String(start.getFullYear()) };
}
