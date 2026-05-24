/**
 * Loader + parser for sjekksynlighet-artikler.
 *
 * Vite bundler content/articles/*.md via import.meta.glob (build-time).
 * Vi parser frontmatter inline istedenfor gray-matter fordi gray-matter
 * krever Node's Buffer global og silently fail-er i browser-bundlet.
 * Vår frontmatter er en konstrant shape — 20-linjers parser dekker det.
 */

export interface Article {
  title: string;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  published_at?: string;
  updated_at?: string;
  keyword?: string;
  hero_image?: string;
  author?: string; // slug i authors.ts; default Shad hvis tom
  topic?: string; // slug i topics.ts
  content: string;
  excerpt: string;
}

const modules = import.meta.glob("/content/articles/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(
  raw: string,
): { data: Record<string, string>; content: string } | null {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;
  const [, block, body] = match;
  const data: Record<string, string> = {};
  for (const line of block.split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, rawValue] = kv;
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      try {
        value = value.startsWith('"') ? JSON.parse(value) : value.slice(1, -1);
      } catch {
        value = value.slice(1, -1);
      }
    }
    data[key] = value;
  }
  return { data, content: body };
}

function buildExcerpt(body: string, maxChars = 180): string {
  const stripped = body
    .replace(/^#+\s.*$/gm, "")
    .replace(/:::\w+/g, "")
    .replace(/:::/g, "")
    .replace(/[*_`#\[\]>]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  if (stripped.length <= maxChars) return stripped;
  const cut = stripped.slice(0, maxChars);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

function parseOne(raw: string): Article | null {
  const parsed = parseFrontmatter(raw);
  if (!parsed) return null;
  const { data, content } = parsed;
  if (!data.slug || !data.title) return null;
  return {
    title: data.title,
    slug: data.slug,
    meta_title: data.meta_title,
    meta_description: data.meta_description,
    published_at: data.published_at,
    updated_at: data.updated_at,
    keyword: data.keyword,
    hero_image: data.hero_image,
    author: data.author,
    topic: data.topic,
    content: content.trim(),
    excerpt: buildExcerpt(content),
  };
}

export const articles: Article[] = Object.values(modules)
  .map(parseOne)
  .filter((a): a is Article => a !== null)
  .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
