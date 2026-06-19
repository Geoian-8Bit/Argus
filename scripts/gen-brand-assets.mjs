// Genera los assets de marca a partir del logo original (brand/argus-logo-source.png).
// El original trae un fondo de damero (gris/blanco) horneado, no transparencia real,
// así que extraemos el logo por color: los píxeles con croma alto (el verde de marca)
// se conservan y el resto se vuelve transparente.
//
// Salidas:
// - public/argus-logo.png    → logo completo (símbolo + "ARGUS"), transparente
// - public/argus-symbol.png  → solo el símbolo (ojo), transparente
// - public/icons/icon-{192,512}.png + icon-512-maskable.png → iconos PWA (fondo crema)
// - public/apple-touch-icon.png y public/favicon-32.png
//
// Uso: node scripts/gen-brand-assets.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = 'brand/argus-logo-source.png';
const CREAM = { r: 248, g: 244, b: 236, alpha: 1 }; // #F8F4EC (fondo de la app)
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
const CHROMA_THRESHOLD = 24; // por debajo = gris/blanco (fondo); por encima = logo

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

// Recorta el logo por croma: deja el verde, vuelve transparente el damero.
const keyed = Buffer.alloc(W * H * 4);
let minX = W,
  minY = H,
  maxX = 0,
  maxY = 0;
const cutY = Math.round(H * 0.62); // el texto "ARGUS" queda por debajo de esta línea
let symMinX = W,
  symMinY = H,
  symMaxX = 0,
  symMaxY = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const p = (y * W + x) * C;
    const r = data[p],
      g = data[p + 1],
      b = data[p + 2];
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    const q = (y * W + x) * 4;
    if (chroma > CHROMA_THRESHOLD) {
      keyed[q] = r;
      keyed[q + 1] = g;
      keyed[q + 2] = b;
      keyed[q + 3] = 255;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (y < cutY) {
        if (x < symMinX) symMinX = x;
        if (x > symMaxX) symMaxX = x;
        if (y < symMinY) symMinY = y;
        if (y > symMaxY) symMaxY = y;
      }
    }
  }
}

const keyedPng = await sharp(keyed, { raw: { width: W, height: H, channels: 4 } })
  .png()
  .toBuffer();

const pad = 6;
const box = (x0, y0, x1, y1) => ({
  left: Math.max(0, x0 - pad),
  top: Math.max(0, y0 - pad),
  width: Math.min(W, x1 + pad) - Math.max(0, x0 - pad),
  height: Math.min(H, y1 + pad) - Math.max(0, y0 - pad),
});

// Logo completo (símbolo + texto), transparente.
await sharp(keyedPng)
  .extract(box(minX, minY, maxX, maxY))
  .resize({ width: 640 })
  .png()
  .toFile('public/argus-logo.png');

// Solo el símbolo (franja superior).
const symbol = await sharp(keyedPng)
  .extract(box(symMinX, symMinY, symMaxX, symMaxY))
  .png()
  .toBuffer();
console.log(`Símbolo: ${symMaxX - symMinX + 1}x${symMaxY - symMinY + 1}`);
await sharp(symbol).resize({ width: 256 }).png().toFile('public/argus-symbol.png');

// Icono cuadrado: símbolo centrado sobre fondo crema, con padding.
async function icon(size, fillRatio, background, out) {
  const inner = Math.round(size * fillRatio);
  const resized = await sharp(symbol)
    .resize({ width: inner, height: inner, fit: 'contain', background: TRANSPARENT })
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: resized, gravity: 'center' }])
    .png()
    .toFile(out);
}

await mkdir('public/icons', { recursive: true });
await icon(192, 0.74, CREAM, 'public/icons/icon-192.png');
await icon(512, 0.74, CREAM, 'public/icons/icon-512.png');
// Maskable: más margen para respetar la zona segura del recorte circular.
await icon(512, 0.6, CREAM, 'public/icons/icon-512-maskable.png');
await icon(180, 0.74, CREAM, 'public/apple-touch-icon.png');
await icon(32, 0.88, CREAM, 'public/favicon-32.png');

console.log('Assets de marca generados en public/.');
