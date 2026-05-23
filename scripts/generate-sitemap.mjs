#!/usr/bin/env node
/**
 * Genererer public/sitemap.xml som en prebuild-step.
 *
 * sjekksynlighet.no er liten — to ruter (/ og /personvern). Vi
 * regenererer likevel hver build slik at <lastmod> alltid speiler
 * siste deploy. Stale sitemap er ett av punktene Sjekksynlighet
 * selv flagger på andre nettsider — vi skal score 10/10 på den.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public", "sitemap.xml");
const SITE = "https://sjekksynlighet.no";
const TODAY = new Date().toISOString().slice(0, 10);

const ROUTES = [
  { path: "/", changefreq: "monthly", priority: "1.0" },
  { path: "/personvern", changefreq: "yearly", priority: "0.3" },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(
  (r) => `  <url>
    <loc>${SITE}${r.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
).join("\n")}
</urlset>
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, xml, "utf8");
console.log(`[sitemap] Wrote ${OUT} with ${ROUTES.length} routes (lastmod ${TODAY})`);
