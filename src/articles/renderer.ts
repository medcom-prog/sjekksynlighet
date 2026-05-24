/**
 * Tailwind-aware markdown-renderer med plain/technical-toggle.
 *
 * Bruker `marked` (v18 token-object-API) med custom Renderer + custom
 * extension som tolker sjekksynlighet sin signatur-syntax
 * `:::technical ... :::` til <details>-blokker som default er
 * kollapset. Dette er hvordan vi server BÅDE bedriftseiere
 * (plain default) OG utviklere (vis-toggle) i samme artikkel.
 *
 * Klasse-strategi: vi piggybacker på sjekksynlighet sine Tailwind-
 * tokens (text-foreground, text-accent, bg-card osv) i stedet for
 * @tailwindcss/typography. Holder bundle lett + matcher resten av UI-en.
 */
import { marked, type RendererObject, type Tokens } from "marked";
import { slugify } from "./headingUtils";

const renderer: RendererObject = {
  heading({ text, depth, tokens }: Tokens.Heading) {
    const cls: Record<number, string> = {
      1: "font-display text-3xl md:text-4xl font-semibold tracking-tight text-foreground mt-10 mb-4",
      2: "font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground mt-12 mb-4 scroll-mt-24",
      3: "font-display text-xl font-semibold tracking-tight text-foreground mt-8 mb-3 scroll-mt-24",
      4: "font-display text-lg font-semibold text-foreground mt-6 mb-2",
    };
    const classes = cls[depth] ?? cls[4];
    const inner = this.parser.parseInline(tokens);
    const plainText = inner.replace(/<[^>]+>/g, "");
    const id = (depth === 2 || depth === 3) ? ` id="${slugify(plainText)}"` : "";
    return `<h${depth}${id} class="${classes}">${inner}</h${depth}>\n`;
  },

  paragraph({ tokens }: Tokens.Paragraph) {
    return `<p class="my-4 leading-relaxed text-[15px] sm:text-base text-foreground/85">${this.parser.parseInline(tokens)}</p>\n`;
  },

  list({ ordered, items }: Tokens.List) {
    const tag = ordered ? "ol" : "ul";
    const listCls = ordered ? "list-decimal marker:text-accent" : "list-disc marker:text-accent";
    const body = items.map((item) => this.listitem(item)).join("");
    return `<${tag} class="my-5 ${listCls} pl-6 space-y-2 text-foreground/85">${body}</${tag}>\n`;
  },

  listitem(item: Tokens.ListItem) {
    return `<li class="leading-relaxed">${this.parser.parse(item.tokens)}</li>\n`;
  },

  link({ href, title, tokens }: Tokens.Link) {
    const t = title ? ` title="${title}"` : "";
    const text = this.parser.parseInline(tokens);
    // Eksterne lenker (Medcom, Schema.org, etc) får target=_blank.
    const isExternal = href.startsWith("http") && !href.includes("sjekksynlighet.no");
    const targetAttr = isExternal ? ` target="_blank" rel="noopener noreferrer"` : "";
    return `<a href="${href}"${t}${targetAttr} class="text-accent font-medium underline decoration-accent/30 underline-offset-2 hover:decoration-accent transition-colors">${text}</a>`;
  },

  strong({ tokens }: Tokens.Strong) {
    return `<strong class="font-semibold text-foreground">${this.parser.parseInline(tokens)}</strong>`;
  },

  em({ tokens }: Tokens.Em) {
    return `<em class="italic">${this.parser.parseInline(tokens)}</em>`;
  },

  blockquote({ tokens }: Tokens.Blockquote) {
    // Sjekksynlighet's "Kort fortalt"-blokk-stil — left teal-stripe,
    // matcher .quick-answer fra index.css. Strip p-margins inni siden
    // blockquote ER paragrafen i seg selv.
    const inner = this.parser.parse(tokens).replace(/class="my-4 leading-relaxed/g, 'class="m-0 leading-relaxed');
    return `<blockquote class="my-6 rounded-2xl border border-accent/15 bg-white/75 backdrop-blur px-5 py-4 sm:px-6 sm:py-5 text-base sm:text-[1.0625rem] leading-relaxed text-foreground/80 shadow-[inset_3px_0_0_0_hsl(var(--accent))]">${inner}</blockquote>\n`;
  },

  code({ text, lang }: Tokens.Code) {
    const langCls = lang ? ` language-${lang}` : "";
    return `<pre class="my-6 rounded-xl border border-border bg-foreground/[0.04] p-4 overflow-x-auto"><code class="text-[13px] font-mono text-foreground/90${langCls}">${text}</code></pre>\n`;
  },

  codespan({ text }: Tokens.Codespan) {
    return `<code class="rounded bg-foreground/[0.06] border border-border/60 px-1.5 py-0.5 text-[13px] font-mono">${text}</code>`;
  },

  hr() {
    return '<hr class="my-10 border-border" />\n';
  },

  image({ href, title, text }: Tokens.Image) {
    const t = title ? ` title="${title}"` : "";
    return `<img src="${href}"${t} alt="${text ?? ""}" class="my-6 rounded-2xl w-full" loading="lazy" />`;
  },
};

/**
 * Custom marked-extension for `:::technical ... :::` blokker.
 *
 * Konverterer til <details>-blokk som er kollapset by default.
 * Brukeren ser "Vis teknisk detalj for utvikler"-knappen og kan velge
 * å åpne. Innholdet inni rendres med fulle markdown-regler (nestet).
 *
 * NB: tokenizer MÅ bruke `this.lexer.blockTokens(...)` for å parse
 * inner-content, IKKE `marked.lexer(...)`. Sistnevnte oppretter en ny
 * Lexer-instans som korrupter den ytre parser-stateen — etter første
 * teknisk-blokk vil alle påfølgende headings/paragrafer/lister få
 * tomme `tokens`-arrays. Verifisert via browser-inspeksjon mai 2026.
 */
type TechnicalToken = {
  type: "technicalBlock";
  raw: string;
  text: string;
  tokens: Tokens.Generic[];
};

marked.use({
  renderer,
  gfm: true,
  breaks: false,
  extensions: [
    {
      name: "technicalBlock",
      level: "block",
      start(src: string) {
        return src.match(/^:::technical/m)?.index;
      },
      tokenizer(src: string) {
        const rule = /^:::technical\n([\s\S]*?)\n:::(?:\n|$)/;
        const match = rule.exec(src);
        if (match) {
          const inner = match[1].trim();
          const tokens: Tokens.Generic[] = [];
          this.lexer.blockTokens(inner, tokens);
          const token: TechnicalToken = {
            type: "technicalBlock",
            raw: match[0],
            text: inner,
            tokens,
          };
          return token as unknown as ReturnType<NonNullable<import("marked").TokenizerExtension["tokenizer"]>>;
        }
        return undefined;
      },
      renderer(token) {
        const t = token as TechnicalToken;
        const innerHtml = this.parser.parse(t.tokens);
        return `<details class="group/tech my-6 rounded-xl border border-dashed border-accent/30 bg-foreground/[0.02] overflow-hidden">
  <summary class="cursor-pointer select-none px-4 py-3 text-xs font-semibold uppercase tracking-wider text-accent flex items-center justify-between hover:bg-accent/[0.04] transition-colors">
    <span class="inline-flex items-center gap-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
      Teknisk detalj for utvikler
    </span>
    <span class="text-foreground/40 group-open/tech:hidden">vis</span>
    <span class="text-foreground/40 hidden group-open/tech:inline">skjul</span>
  </summary>
  <div class="px-4 pb-4 pt-1 [&_p]:text-foreground/75 [&_p]:text-[14px] [&_code]:text-[12px]">${innerHtml}</div>
</details>`;
      },
    },
  ],
});

export function renderMarkdown(source: string): string {
  return marked.parse(source) as string;
}
