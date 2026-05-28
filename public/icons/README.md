# Iconos PWA

Coloca aquí los iconos de la PWA con estos nombres exactos (vienen referenciados desde `vite.config.ts`):

- `icon-192.png` — 192×192 px
- `icon-512.png` — 512×512 px
- `icon-512-maskable.png` — 512×512 px, zona segura central (maskable)

Mientras no existan, el manifest seguirá apuntando a estos archivos pero el navegador usará el `favicon.svg` como fallback. La aplicación funciona igualmente; solo afecta a la instalación como PWA.

Sugerencia: generar los tres con <https://realfavicongenerator.net> o cualquier editor (Figma, Squoosh, ImageMagick).
