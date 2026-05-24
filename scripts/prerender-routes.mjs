#!/usr/bin/env node
/**
 * Per-route static HTML for SPA SEO.
 *
 * sjekksynlighet.no er en Vite/React SPA. Uten prerender ser alle
 * crawlere identisk HTML-skall — det fører til Soft 404-verdikt fra
 * Google (PITFALLS #1) og null kontekst for AI-bots som ikke kjører
 * JavaScript (GPTBot, ClaudeBot, CCBot).
 *
 * Skriptet kjører etter `vite build` og lager:
 *   dist/personvern/index.html
 *
 * Forsiden trenger ikke egen behandling — index.html i roten dekker
 * den, og scriptet legger til en home-FAQ-mirror der hvis det er
 * relevant (i denne MVP har vi allerede FAQ i hovedskallet).
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const ARTICLES_DIR = join(ROOT, "content", "articles");
const SHELL_PATH = join(DIST, "index.html");
const SITE = "https://sjekksynlighet.no";

if (!existsSync(SHELL_PATH)) {
  console.error("[prerender] dist/index.html not found — kjør 'vite build' først");
  process.exit(1);
}

const SHELL = readFileSync(SHELL_PATH, "utf8");

/**
 * Statiske ruter — /personvern + /om + /artikler-index.
 */
const STATIC_ROUTES = [
  {
    path: "/personvern",
    title: "Personvern — Sjekksynlighet",
    description:
      "Personvernerklæring for sjekksynlighet.no. Medcom AS er behandlingsansvarlig (org.nr 936 155 731). Dine GDPR-rettigheter, hva vi lagrer og hvor lenge.",
    h1: "Personvernerklæring for sjekksynlighet.no",
    intro:
      "Sjekksynlighet er et selvstendig verktøy operert av Medcom AS. Denne siden forklarer hva vi lagrer når du kjører en synlighetscheck, hvor lenge, hvem som har tilgang, og hvilke GDPR-rettigheter du har.",
    schemaGraph: (url) => [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: "Personvernerklæring",
        description:
          "GDPR-policy for sjekksynlighet.no. Behandlingsansvarlig: Medcom AS, org.nr 936155731.",
        isPartOf: { "@id": `${SITE}/#website` },
        inLanguage: "nb-NO",
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "[data-quick-answer]"],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Hjem", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Personvern", item: url },
        ],
      },
    ],
  },
  {
    path: "/om",
    title: "Om Sjekksynlighet",
    description:
      "Sjekksynlighet er et gratis verktøy bygd av Medcom AS for å gjøre AI-synlighet målbart for norske bedrifter.",
    h1: "Hvem står bak Sjekksynlighet?",
    intro:
      "Sjekksynlighet er bygd og driftet av Medcom AS, et norsk webbyrå med spesialisering på AEO (Answer Engine Optimization). Vi laget det fordi vi var lei av at norske bedrifter ikke hadde et gratis sted å sjekke sin AI-synlighet uten å betale en konsulent.",
    schemaGraph: (url) => [
      {
        "@type": "AboutPage",
        "@id": `${url}#webpage`,
        url,
        name: "Om Sjekksynlighet",
        description:
          "Opphavshistorie for sjekksynlighet.no — bygd av Medcom AS, gratis verktøy for AI-synlighet.",
        isPartOf: { "@id": `${SITE}/#website` },
        about: { "@id": `${SITE}/#organization` },
        inLanguage: "nb-NO",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Hjem", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Om", item: url },
        ],
      },
    ],
  },
  {
    path: "/artikler",
    title: "Artikler — AEO og AI-synlighet forklart",
    description:
      "Praktisk kunnskap om Answer Engine Optimization, schema.org, AI-crawlere og hvordan norske bedrifter blir sitert av ChatGPT, Gemini og Perplexity.",
    h1: "Slik fungerer AI-synlighet",
    intro:
      "Vi sjekker ti tekniske AEO-signaler. Her forklarer vi hva de er, hvorfor de teller, og hvordan du fikser dem — uten teknisk-prat.",
    schemaGraph: (url) => [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: "Artikler — AEO og AI-synlighet forklart",
        isPartOf: { "@id": `${SITE}/#website` },
        inLanguage: "nb-NO",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Hjem", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Artikler", item: url },
        ],
      },
    ],
  },
];

/**
 * Les artikkel-md filer → byg ROUTES-array med per-route schema og
 * H1+intro. Hver artikkel får BlogPosting + BreadcrumbList for
 * non-JS-crawlere. (React-versjonen emitter ytterligere ItemList
 * for ToC + relatedLink for cluster-siblings ved hydration.)
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
      const { data, content } = matter(raw);
      if (!data.slug || !data.title) continue;
      // Plukk ut første paragraf (etter > blockquote) som intro
      const firstParagraph =
        content
          .split(/\n\n+/)
          .map((p) => p.trim())
          .find((p) => p && !p.startsWith(">") && !p.startsWith("#") && !p.startsWith(":::")) ?? "";
      const intro = firstParagraph.replace(/\s+/g, " ").slice(0, 280);
      articles.push({
        slug: data.slug,
        title: data.title,
        meta_title: data.meta_title || data.title,
        meta_description: data.meta_description || intro,
        published_at: data.published_at,
        updated_at: data.updated_at || data.published_at,
        keyword: data.keyword,
        hero_image: data.hero_image,
        h1: data.title,
        intro,
      });
    } catch {
      // skip
    }
  }
  return articles;
}

const articles = readArticles();

const ARTICLE_ROUTES = articles.map((a) => ({
  path: `/artikler/${a.slug}`,
  title: a.meta_title,
  description: a.meta_description,
  h1: a.h1,
  intro: a.intro,
  schemaGraph: (url) => [
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      url,
      headline: a.title,
      description: a.meta_description,
      ...(a.hero_image ? { image: a.hero_image } : {}),
      datePublished: a.published_at,
      dateModified: a.updated_at,
      inLanguage: "nb-NO",
      ...(a.keyword ? { keywords: a.keyword } : {}),
      author: {
        "@type": "Person",
        name: "Shad Mohu",
        jobTitle: "Markedsføringsleder hos Medcom AS",
        url: "https://www.medcom.no/team#shad",
        worksFor: {
          "@type": "Organization",
          "@id": "https://www.medcom.no/#organization",
          name: "Medcom AS",
          url: "https://www.medcom.no",
        },
      },
      publisher: {
        "@type": "Organization",
        "@id": `${SITE}/#organization`,
        name: "Sjekksynlighet",
        logo: { "@type": "ImageObject", url: `${SITE}/og-image.png` },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Hjem", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Artikler", item: `${SITE}/artikler` },
        { "@type": "ListItem", position: 3, name: a.title, item: url },
      ],
    },
  ],
}));

const ROUTES = [...STATIC_ROUTES, ...ARTICLE_ROUTES];

function htmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function injectMeta(html, { title, description, url, h1, intro }) {
  const safeTitle = htmlEscape(title);
  const safeDesc = htmlEscape(description);
  const safeUrl = htmlEscape(url);
  const safeH1 = htmlEscape(h1);
  const safeIntro = htmlEscape(intro);

  let out = html;

  out = out.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);

  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${safeDesc}" />`,
  );

  out = out.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${safeTitle}" />`,
  );

  out = out.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${safeDesc}" />`,
  );

  out = out.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${safeUrl}" />`,
  );

  out = out.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${safeTitle}" />`,
  );

  out = out.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${safeDesc}" />`,
  );

  out = out.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${safeUrl}" />`,
  );

  out = out.replace(
    /<link\s+rel="alternate"\s+hreflang="nb-NO"\s+href="[^"]*"\s*\/?>/,
    `<link rel="alternate" hreflang="nb-NO" href="${safeUrl}" />`,
  );

  // Injiser H1 + intro i #root så non-JS crawlere har faktisk
  // tekstinnhold å parse.
  out = out.replace(
    /<div id="root"><\/div>/,
    `<div id="root"><h1>${safeH1}</h1><p>${safeIntro}</p></div>`,
  );

  return out;
}

function injectSchema(html, graph) {
  const payload = {
    "@context": "https://schema.org",
    "@graph": graph,
  };
  const tag = `<script type="application/ld+json" data-prerender-route>${JSON.stringify(payload)}</script>\n  </head>`;
  return html.replace("</head>", tag);
}

let count = 0;
for (const r of ROUTES) {
  const url = `${SITE}${r.path}`;
  const html = injectSchema(
    injectMeta(SHELL, {
      title: r.title,
      description: r.description,
      url,
      h1: r.h1,
      intro: r.intro,
    }),
    r.schemaGraph(url),
  );
  const outDir = join(DIST, r.path.replace(/^\//, ""));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html, "utf8");
  count++;
}

console.log(`[prerender] Wrote ${count} per-route HTML file${count === 1 ? "" : "s"}`);
