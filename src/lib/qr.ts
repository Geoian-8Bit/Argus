import QRCode from 'qrcode';

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 256,
  });
}

export async function generateQrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: 'svg', errorCorrectionLevel: 'M', margin: 1 });
}
