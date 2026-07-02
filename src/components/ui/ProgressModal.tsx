import { QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressModalProps {
  open: boolean;
  title: string;
  message?: string;
  /** Progreso de 0 a 1. */
  progress: number;
  className?: string;
}

/**
 * Modal bloqueante con barra de progreso animada (degradado + rayas + barrido
 * de luz). Pensado para tareas largas en cliente, p. ej. generar el PDF de QR.
 * Las animaciones se anulan solas con `prefers-reduced-motion` (ver index.css).
 */
export function ProgressModal({ open, title, message, progress, className }: ProgressModalProps) {
  if (!open) return null;
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 animate-fade-in bg-foreground/40 backdrop-blur-sm" />

      <div
        className={cn(
          'relative w-full max-w-sm animate-modal-in rounded-2xl border border-border bg-card p-6 text-center shadow-lg',
          className,
        )}
      >
        {/* Icono con anillo giratorio */}
        <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center">
          <span
            className="absolute inset-0 animate-spin rounded-full [animation-duration:1.4s]"
            style={{ background: 'conic-gradient(from 90deg, transparent, hsl(var(--primary)))' }}
          />
          <span className="absolute inset-[3px] rounded-full bg-card" />
          <QrCode className="relative h-6 w-6 text-primary" aria-hidden="true" />
        </div>

        <h2 className="font-display text-base font-semibold">{title}</h2>
        {message && <p className="mt-1 min-h-5 text-sm text-muted-foreground">{message}</p>}

        {/* Barra de progreso */}
        <div className="mt-5">
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="relative h-3 w-full overflow-hidden rounded-full bg-muted shadow-inner"
          >
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-primary to-[hsl(152_62%_52%)] transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            >
              {/* Rayas diagonales que se desplazan */}
              <div
                className="absolute inset-0 animate-progress-stripes rounded-full opacity-25"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, rgba(255,255,255,.6) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.6) 50%, rgba(255,255,255,.6) 75%, transparent 75%, transparent)',
                  backgroundSize: '1rem 1rem',
                }}
              />
              {/* Brillo pulsante en el borde de avance */}
              <div className="absolute right-0 top-0 h-full w-6 animate-pulse-glow bg-white/50 blur-[6px]" />
            </div>
            {/* Barrido de luz sobre toda la pista */}
            <div className="pointer-events-none absolute inset-0 animate-progress-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>No cierres la aplicación</span>
            <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
              {pct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
