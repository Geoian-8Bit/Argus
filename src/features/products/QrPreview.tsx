import { useEffect, useState } from 'react';
import { generateQrDataUrl, generateQrSvg } from '@/lib/qr';

interface QrPreviewProps {
  value: string;
  label?: string;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export function QrPreview({ value, label }: QrPreviewProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setDataUrl(null);

    generateQrDataUrl(value)
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No se pudo generar el QR.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [value]);

  async function handleDownloadPng() {
    if (!dataUrl) return;
    const blob = await dataUrlToBlob(dataUrl);
    downloadBlob(blob, `${value}.png`);
  }

  async function handleDownloadSvg() {
    const svg = await generateQrSvg(value);
    downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${value}.svg`);
  }

  function handlePrint() {
    window.print();
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4 text-center">
      <div className="flex justify-center print:py-6">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={label ? `QR de ${label}` : `QR ${value}`}
            width={256}
            height={256}
            className="h-64 w-64"
          />
        ) : (
          <div className="h-64 w-64 animate-pulse bg-muted" />
        )}
      </div>
      <p className="font-mono text-sm">{value}</p>
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      <div className="grid grid-cols-3 gap-2 print:hidden">
        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={!dataUrl}
          className="rounded-md border border-input py-2 text-sm disabled:opacity-50"
        >
          PNG
        </button>
        <button
          type="button"
          onClick={handleDownloadSvg}
          className="rounded-md border border-input py-2 text-sm"
        >
          SVG
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="rounded-md border border-input py-2 text-sm"
        >
          Imprimir
        </button>
      </div>
    </div>
  );
}
