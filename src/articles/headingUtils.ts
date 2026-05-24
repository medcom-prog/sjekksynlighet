/**
 * Heading slugify + ToC extraction.
 *
 * Brukes av renderer-en (for å feste `id`-attr på <h2>/<h3>) og av
 * <TableOfContents> (for å bygge sidebar-lenkene). Én sannhetskilde
 * så anchor-IDene alltid matcher.
 */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[æä]/g, "ae")
    .replace(/[øö]/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export interface TocItem {
  level: 2 | 3;
  text: string;
  slug: string;
}

/**
 * Walk markdown og pluck ut H2/H3 som ToC-items. Skipper fenced
 * code blocks så en ```ts ## comment ikke havner i sidebar.
 */
export function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const FENCE = "```";
  let inCodeBlock = false;
  for (const line of markdown.split("\n")) {
    if (line.startsWith(FENCE)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const m = line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (!m) continue;
    const level = m[1].length === 2 ? 2 : 3;
    const text = m[2].trim();
    items.push({ level, text, slug: slugify(text) });
  }
  return items;
}
