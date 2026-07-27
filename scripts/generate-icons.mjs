// Generates the PWA / favicon icon set from a single SVG mark using sharp
// (already a transitive dependency via Next). Re-run with: node scripts/generate-icons.mjs
// The mark is the app's gold "trending up" line on a dark rounded square,
// matching the header brand.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const GOLD_A = "#b98f4e";
const GOLD_B = "#e4c48a";
const BG_TOP = "#1c1712";
const BG_BOTTOM = "#0f0c0a";

// Trending-up mark (lucide-style), centered in a 512 viewBox with a safe margin
// so it survives the maskable safe zone.
function svg({ maskable }) {
  // Maskable icons are full-bleed (the OS applies its own mask); regular icons
  // get rounded corners baked in.
  const rx = maskable ? 0 : 112;
  return `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${BG_TOP}"/>
      <stop offset="1" stop-color="${BG_BOTTOM}"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="${GOLD_A}"/>
      <stop offset="1" stop-color="${GOLD_B}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${rx}" fill="url(#bg)"/>
  <g fill="none" stroke="url(#gold)" stroke-width="30"
     stroke-linecap="round" stroke-linejoin="round">
    <polyline points="143,313 216,239 273,296 369,199"/>
    <polyline points="301,199 369,199 369,267"/>
  </g>
</svg>`;
}

const rounded = Buffer.from(svg({ maskable: false }));
const maskable = Buffer.from(svg({ maskable: true }));

const targets = [
  { src: rounded, size: 512, out: "src/app/icon.png" },
  { src: rounded, size: 180, out: "src/app/apple-icon.png" },
  { src: rounded, size: 192, out: "public/icon-192.png" },
  { src: rounded, size: 512, out: "public/icon-512.png" },
  { src: maskable, size: 512, out: "public/icon-maskable-512.png" },
];

for (const { src, size, out } of targets) {
  await mkdir(dirname(out), { recursive: true });
  await sharp(src).resize(size, size).png().toFile(out);
  console.log(`wrote ${out} (${size}x${size})`);
}
