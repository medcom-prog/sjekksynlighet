import { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import DOMPurify from "isomorphic-dompurify";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetaHead } from "./MetaHead";
import { getArticleBySlug } from "./articles";
import { getAuthorBySlug } from "./authors";
import { renderMarkdown } from "./renderer";
import { extractToc } from "./headingUtils";
import { TableOfContents } from "./TableOfContents";
import { RelatedArticles } from "./RelatedArticles";
import { TopicCluster } from "./TopicCluster";
import { AuthorBio } from "./AuthorBio";
import { getClusterForSlug, getClusterSiblings } from "./topics";
import { FadeUp } from "@/components/FadeUp";

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://sjekksynlighet.no";

export default function ArticlePost() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;
  const tocItems = useMemo(() => (article ? extractToc(article.content) : []), [article]);

  if (!slug || !article) {
    return <Navigate to="/artikler" replace />;
  }

  const html = DOMPurify.sanitize(renderMarkdown(article.content), {
    ADD_TAGS: ["details", "summary"],
    ADD_ATTR: ["open", "loading"],
  });
  const canonical = `${SITE_URL}/artikler/${article.slug}`;
  const author = getAuthorBySlug(article.author ?? article.slug);
  const cluster = getClusterForSlug(article.slug);
  const siblingUrls = getClusterSiblings(article.slug).map(
    (s) => `${SITE_URL}/artikler/${s}`,
  );
  const wordCount = article.content.split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.round(wordCount / 220));

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.meta_description ?? "",
    image: article.hero_image ?? undefined,
    datePublished: article.published_at,
    dateModified: article.updated_at ?? article.published_at,
    author: {
      "@type": "Person",
      name: author.name,
      jobTitle: author.position,
      url: author.medcomTeamUrl,
      worksFor: {
        "@type": "Organization",
        "@id": "https://www.medcom.no/#organization",
        name: "Medcom AS",
        url: "https://www.medcom.no",
        sameAs: [
          "https://www.brreg.no/enhet/936155731",
          "https://www.proff.no/selskap/medcom-as/larvik/dataprogramvare-og-utvikling/IFHD2DV009O",
        ],
      },
      knowsAbout: author.expertise,
      ...(author.linkedin ? { sameAs: [author.linkedin] } : {}),
    },
    publisher: {
      "@type": "Organization",
      "@id": "https://sjekksynlighet.no/#organization",
      name: "Sjekksynlighet",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    inLanguage: "nb-NO",
    wordCount,
    keywords: article.keyword ?? undefined,
    ...(cluster ? {
      about: { "@type": "Thing", name: cluster.name },
      isPartOf: {
        "@type": "Blog",
        "@id": `${SITE_URL}/artikler#${cluster.slug}`,
        name: cluster.name,
      },
    } : {}),
    ...(siblingUrls.length > 0 ? { relatedLink: siblingUrls } : {}),
  };

  const breadcrumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hjem", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Artikler", item: `${SITE_URL}/artikler` },
      { "@type": "ListItem", position: 3, name: article.title, item: canonical },
    ],
  };

  const itemListLd = tocItems.length >= 2 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: tocItems.length,
    name: `Innhold i: ${article.title}`,
    itemListElement: tocItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.text,
      url: `${canonical}#${item.slug}`,
    })),
  } : null;

  const showUpdatedStamp =
    article.updated_at &&
    article.published_at &&
    article.updated_at !== article.published_at;

  return (
    <>
      <MetaHead
        title={article.meta_title ?? article.title}
        description={article.meta_description}
        ogImage={article.hero_image}
        canonical={canonical}
        type="article"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />
      {itemListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      )}

      <section className="container mx-auto max-w-6xl px-4 py-10 sm:py-14 lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-10">
        <article className="lg:max-w-3xl min-w-0">
          <nav className="mb-6">
            <Link
              to="/artikler"
              className="inline-flex items-center gap-1.5 text-sm text-foreground/55 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Tilbake til artikler
            </Link>
          </nav>

          <FadeUp immediate as="header" className="mb-8 space-y-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-wider text-foreground/55">
              <span className="normal-case tracking-normal">
                Av{" "}
                <span className="font-medium text-foreground">{author.name}</span>
              </span>
              <span aria-hidden="true">·</span>
              {article.published_at && (
                <>
                  <span>
                    {new Date(article.published_at).toLocaleDateString("nb-NO", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span>{readMinutes} min lesetid</span>
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight leading-[1.1] text-foreground sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>
            {article.meta_description && (
              <p className="text-base sm:text-lg text-foreground/70 leading-relaxed">
                {article.meta_description}
              </p>
            )}
            {showUpdatedStamp && (
              <p className="text-xs italic text-foreground/50">
                Sist oppdatert{" "}
                {new Date(article.updated_at!).toLocaleDateString("nb-NO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </FadeUp>

          {article.hero_image && (
            <img
              src={article.hero_image}
              alt={article.title}
              className="mb-10 w-full aspect-video object-cover rounded-2xl"
              loading="lazy"
            />
          )}

          <div className="max-w-none" dangerouslySetInnerHTML={{ __html: html }} />

          {/* Sluttet-CTA — ren, eneste CTA på hele artikkelen */}
          <FadeUp className="mt-12 rounded-2xl border border-accent/20 bg-accent/[0.04] p-6 text-center sm:p-8">
            <p className="font-display text-lg font-semibold text-foreground">
              Klar til å sjekke din egen synlighet?
            </p>
            <p className="mt-1 text-sm text-foreground/65">
              30 sekunder. Gratis. Ingen registrering.
            </p>
            <Button
              asChild
              className="mt-4 transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
            >
              <Link to="/">
                Kjør sjekken
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </FadeUp>

          <TopicCluster currentSlug={article.slug} />
          <AuthorBio author={author} />
          <RelatedArticles currentSlug={article.slug} />
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8">
            <TableOfContents items={tocItems} />
          </div>
        </aside>
      </section>
    </>
  );
}
