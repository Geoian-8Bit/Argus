import { useEffect, useState } from 'react';
import { Download, FileCode2, Printer } from 'lucide-react';
import { generateQrDataUrl, generateQrSvg } from '@/lib/qr';
import { Card, Button, Skeleton } from '@/components/ui';

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
    <Card className="space-y-3 p-4 text-center">
      <div className="flex justify-center print:py-6">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={label ? `QR de ${label}` : `QR ${value}`}
            width={256}
            height={256}
            className="h-56 w-56 rounded-md bg-white p-2"
          />
        ) : (
          <Skeleton className="h-56 w-56" />
        )}
      </div>
      <p className="font-mono text-sm font-medium">{value}</p>
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      <div className="grid grid-cols-3 gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={handleDownloadPng} disabled={!dataUrl}>
          <Download className="h-4 w-4" aria-hidden="true" />
          PNG
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadSvg}>
          <FileCode2 className="h-4 w-4" aria-hidden="true" />
          SVG
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4" aria-hidden="true" />
          Imprimir
        </Button>
      </div>
    </Card>
  );
}
