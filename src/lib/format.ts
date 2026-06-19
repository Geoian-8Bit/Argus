const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

/** Tiempo relativo legible: "hace 5 min", "ayer", etc. */
export function relativeTime(iso: string): string {
  const sec = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const abs = Math.abs(sec);
  if (abs < 60) return rtf.format(sec, 'second');
  const min = Math.round(sec / 60);
  if (Math.abs(min) < 60) return rtf.format(min, 'minute');
  const hr = Math.round(min / 60);
  if (Math.abs(hr) < 24) return rtf.format(hr, 'hour');
  const day = Math.round(hr / 24);
  if (Math.abs(day) < 30) return rtf.format(day, 'day');
  const month = Math.round(day / 30);
  if (Math.abs(month) < 12) return rtf.format(month, 'month');
  return rtf.format(Math.round(month / 12), 'year');
}

const dayFmt = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' });

/** Clave de día (YYYY-MM-DD) en hora local, para agrupar. */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Etiqueta de día: "Hoy", "Ayer" o la fecha completa. */
export function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(iso) === dayKey(today.toISOString())) return 'Hoy';
  if (dayKey(iso) === dayKey(yesterday.toISOString())) return 'Ayer';
  return dayFmt.format(d);
}

/** Hora corta local: "14:05". */
export function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

const moneyFmt = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

/** Importe en euros: "12,50 €". Tolera string (numeric de Postgres) o number. */
export function formatMoney(value: number | string | null | undefined): string {
  return moneyFmt.format(Number(value) || 0);
}
