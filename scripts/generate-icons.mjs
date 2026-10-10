// Génère les icônes du site à partir du symbole SpendEdge (DESIGN.md, « Logo »).
// Usage : node scripts/generate-icons.mjs
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const mark = (size, { padding = 0 } = {}) => {
  const inner = 32 - padding * 2;
  const scale = inner / 32;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="${padding ? 0 : 7.5}" fill="#14243A"/>
  <g transform="translate(${padding} ${padding}) scale(${scale})">
    <circle cx="9.5" cy="16" r="3" fill="#FFFFFF"/>
    <path d="M13.5 16H20.5" stroke="#18B6A4" stroke-width="2" stroke-linecap="round"/>
    <path d="M23.5 8.5V23.5" stroke="#FFFFFF" stroke-width="3" stroke-linecap="square"/>
  </g>
</svg>`;
};

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

// Fichier ICO contenant des images PNG (format accepté par tous les navigateurs actuels).
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach(({ size, data }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...images.map((i) => i.data)]);
}

const svgIcon = mark(32);
await writeFile("src/app/icon.svg", svgIcon);

const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(icoSizes.map(async (size) => ({ size, data: await png(mark(size), size) })));
await writeFile("src/app/favicon.ico", ico(icoImages));

// Icône Apple : fond plein, sans coins arrondis (iOS les arrondit lui-même), marge de sécurité.
await writeFile("src/app/apple-icon.png", await png(mark(180, { padding: 4 }), 180));
await writeFile("public/icon-192.png", await png(mark(192, { padding: 4 }), 192));
await writeFile("public/icon-512.png", await png(mark(512, { padding: 4 }), 512));
console.log("Icônes générées.");
