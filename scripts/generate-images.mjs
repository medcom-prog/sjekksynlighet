#!/usr/bin/env node
/**
 * Genererer alle raster-bilder fra SVG-kildene.
 *
 *   og-image.svg          → og-image.png (1200x630)  for OG/Twitter
 *   favicon.svg           → favicon-16.png / 32.png / 48.png → favicon.ico
 *   favicon.svg           → apple-touch-icon.png (180x180)
 *   favicon.svg           → pwa-192.png (192x192)
 *   favicon.svg           → pwa-512.png (512x512)
 *
 * Kjøres som en del av prebuild, men output committes også fordi
 * SVG → PNG-genereringen er deterministisk og output sjelden endrer
 * seg. Dette betyr at Vercel-bygget ikke trenger å re-generere på
 * hver deploy.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import pngToIco from "png-to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");

function svgToPng(svgPath, outPath, { width, height } = {}) {
  const svg = readFileSync(svgPath, "utf8");
  const opts = width
    ? { fitTo: { mode: "width", value: width } }
    : { fitTo: { mode: "original" } };
  const resvg = new Resvg(svg, opts);
  const pngData = resvg.render().asPng();
  writeFileSync(outPath, pngData);
  console.log(`  ✓ ${outPath.replace(ROOT, ".")}  (${(pngData.length / 1024).toFixed(1)} kB)`);
  return pngData;
}

console.log("[images] Genererer raster-bilder fra SVG-kilder ...");

// 1. OG-image (1200x630, Twitter Card størrelse)
svgToPng(join(PUBLIC, "og-image.svg"), join(PUBLIC, "og-image.png"), {
  width: 1200,
});

// 2. Favicon-varianter
const f16 = svgToPng(join(PUBLIC, "favicon.svg"), join(PUBLIC, "favicon-16.png"), { width: 16 });
const f32 = svgToPng(join(PUBLIC, "favicon.svg"), join(PUBLIC, "favicon-32.png"), { width: 32 });
const f48 = svgToPng(join(PUBLIC, "favicon.svg"), join(PUBLIC, "favicon-48.png"), { width: 48 });

// 3. favicon.ico (multi-resolution — 16/32/48 i én fil)
const icoBuf = await pngToIco([f16, f32, f48]);
writeFileSync(join(PUBLIC, "favicon.ico"), icoBuf);
console.log(`  ✓ public/favicon.ico  (multi-res: 16/32/48, ${(icoBuf.length / 1024).toFixed(1)} kB)`);

// 4. apple-touch-icon (180x180)
svgToPng(join(PUBLIC, "favicon.svg"), join(PUBLIC, "apple-touch-icon.png"), {
  width: 180,
});

// 5. PWA-ikoner (192 + 512)
svgToPng(join(PUBLIC, "favicon.svg"), join(PUBLIC, "pwa-192.png"), { width: 192 });
svgToPng(join(PUBLIC, "favicon.svg"), join(PUBLIC, "pwa-512.png"), { width: 512 });

console.log("[images] Ferdig.");
