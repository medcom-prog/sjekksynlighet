#!/usr/bin/env node
/**
 * Genererer public/sitemap.xml som en prebuild-step.
 *
 * sjekksynlighet.no er liten — to ruter (/ og /personvern). Vi
 * regenererer likevel hver build slik at <lastmod> alltid speiler
 * siste deploy. Stale sitemap er ett av punktene Sjekksynlighet
 * selv flagger på andre nettsider — vi skal score 10/10 på den.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ARTICLES_DIR = join(ROOT, "content", "articles");
const OUT = join(ROOT, "public", "sitemap.xml");
const SITE = "https://sjekksynlighet.no";
const TODAY = new Date().toISOString().slice(0, 10);

const STATIC_ROUTES = [
  { path: "/", changefreq: "monthly", priority: "1.0" },
  { path: "/artikler", changefreq: "weekly", priority: "0.9" },
  { path: "/om", changefreq: "yearly", priority: "0.5" },
  { path: "/personvern", changefreq: "yearly", priority: "0.3" },
];

/**
 * Les alle artikkel-md filer, parse frontmatter med gray-matter
 * (her er vi i Node-context så Buffer er tilgjengelig — i browser
 * bruker vi en inline-parser i src/articles/articles.ts).
 */
function readArticles() {
  let entries = [];
  try {
    entries = readdirSync(ARTICLES_DIR);
  } catch {
    return [];
  }
  const articles = [];
  for (const name of entries) {
    if (!name.endsWith(".md")) continue;
    const raw = readFileSync(join(ARTICLES_DIR, name), "utf8");
    try {
      const { data } = matter(raw);
      if (!data.slug || !data.published_at) continue;
      articles.push({
        slug: String(data.slug),
        lastmod: new Date(data.updated_at || data.published_at).toISOString().slice(0, 10),
      });
    } catch {
      // skip malformed
    }
  }
  return articles;
}

const articles = readArticles();

const urls = [
  ...STATIC_ROUTES.map((r) => ({
    loc: `${SITE}${r.path}`,
    lastmod: TODAY,
    changefreq: r.changefreq,
    priority: r.priority,
  })),
  ...articles.map((a) => ({
    loc: `${SITE}/artikler/${a.slug}`,
    lastmod: a.lastmod,
    changefreq: "monthly",
    priority: "0.7",
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, xml, "utf8");
console.log(
  `[sitemap] Wrote ${OUT} with ${STATIC_ROUTES.length} static + ${articles.length} article entries (lastmod ${TODAY})`,
);
