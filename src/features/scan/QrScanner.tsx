import { useEffect, useId, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

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
    let scanner: Html5Qrcode | null = null;
    setStarting(true);
    setError(null);

    Html5Qrcode.getCameras()
      .then(async (cameras) => {
        if (cancelled) return;
        if (!cameras || cameras.length === 0) {
          setError('No se ha detectado ninguna cámara en este dispositivo.');
          setStarting(false);
          return;
        }
        scanner = new Html5Qrcode(containerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        scannerRef.current = scanner;
        const cameraId =
          cameras.find((c) => /back|rear|environment/i.test(c.label))?.id ?? cameras[0].id;
        try {
          await scanner.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 240, height: 240 },
              aspectRatio: 1,
            },
            (decoded) => {
              onDecoded(decoded);
            },
            () => {
              // ignoramos errores de frames sin código
            },
          );
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
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? `Error accediendo a la cámara: ${err.message}`
            : 'Error accediendo a la cámara.',
        );
        setStarting(false);
      });

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
    <div className="space-y-2">
      <div
        id={containerId}
        className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-black"
      />
      {starting && !error && (
        <p className="text-center text-sm text-muted-foreground">Iniciando cámara…</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
