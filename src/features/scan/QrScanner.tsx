import { useEffect, useId, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { CameraOff } from 'lucide-react';
import { Spinner } from '@/components/ui';

interface QrScannerProps {
  onDecoded: (text: string) => void;
  paused?: boolean;
}

export function QrScanner({ onDecoded, paused = false }: QrScannerProps) {
  const id = useId().replace(/:/g, '');
  const containerId = `qr-reader-${id}`;
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (paused) return;

    let cancelled = false;
    setStarting(true);
    setError(null);

    const scanner = new Html5Qrcode(containerId, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    scannerRef.current = scanner;

    const config = { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 };
    const onScan = (decoded: string) => onDecoded(decoded);
    const onFrameError = () => {
      // ignoramos errores de frames sin código
    };

    async function start() {
      // Arranque rápido: abre directamente la cámara trasera (una sola
      // apertura). Si el dispositivo no acepta facingMode, enumeramos.
      try {
        await scanner.start({ facingMode: { ideal: 'environment' } }, config, onScan, onFrameError);
        if (!cancelled) setStarting(false);
        return;
      } catch {
        // continúa con el fallback
      }

      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cancelled) return;
        if (!cameras || cameras.length === 0) {
          setError('No se ha detectado ninguna cámara en este dispositivo.');
          setStarting(false);
          return;
        }
        const cameraId =
          cameras.find((c) => /back|rear|environment/i.test(c.label))?.id ?? cameras[0].id;
        await scanner.start(cameraId, config, onScan, onFrameError);
        if (!cancelled) setStarting(false);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? `No se pudo abrir la cámara: ${err.message}`
            : 'No se pudo abrir la cámara.',
        );
        setStarting(false);
      }
    }

    void start();

    return () => {
      cancelled = true;
      const current = scannerRef.current;
      scannerRef.current = null;
      if (current && current.isScanning) {
        current
          .stop()
          .catch(() => undefined)
          .finally(() => {
            current.clear();
          });
      }
    };
  }, [containerId, onDecoded, paused]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-black">
        <div
          id={containerId}
          className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
        />

        {!error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-3/5 w-3/5">
              <span className="absolute left-0 top-0 h-7 w-7 rounded-tl-lg border-l-2 border-t-2 border-white/90" />
              <span className="absolute right-0 top-0 h-7 w-7 rounded-tr-lg border-r-2 border-t-2 border-white/90" />
              <span className="absolute bottom-0 left-0 h-7 w-7 rounded-bl-lg border-b-2 border-l-2 border-white/90" />
              <span className="absolute bottom-0 right-0 h-7 w-7 rounded-br-lg border-b-2 border-r-2 border-white/90" />
            </div>
          </div>
        )}

        {starting && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-white">
            <Spinner className="h-5 w-5" label="Iniciando cámara" />
            <p className="text-sm">Iniciando cámara…</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <CameraOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
