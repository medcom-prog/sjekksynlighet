import { useEffect } from "react";

/**
 * Imperative meta-tag-injektor for per-route SEO.
 *
 * React Router 6 har ingen built-in <Helmet>; vi gjør én liten effect
 * som setter document.title + meta-tags når article-pages mounter, og
 * resetter ved unmount. For non-JS crawlere er det prerender-skriptet
 * som setter disse i selve dist/<route>/index.html.
 */
type Props = {
  title: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  type?: "website" | "article";
};

const SITE_NAME = "Sjekksynlighet";

export function MetaHead({ title, description, ogImage, canonical, type = "website" }: Props) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
    const prevTitle = document.title;
    document.title = fullTitle;

    function setMeta(selector: string, attr: string, value: string) {
      let el = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
      if (!el) {
        // Create if missing
        if (selector.startsWith('link[')) {
          el = document.createElement("link");
          const relMatch = selector.match(/rel="([^"]+)"/);
          if (relMatch) el.setAttribute("rel", relMatch[1]);
        } else {
          el = document.createElement("meta");
          const propMatch = selector.match(/(property|name)="([^"]+)"/);
          if (propMatch) el.setAttribute(propMatch[1], propMatch[2]);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    }

    if (description) {
      setMeta('meta[name="description"]', "content", description);
      setMeta('meta[property="og:description"]', "content", description);
      setMeta('meta[name="twitter:description"]', "content", description);
    }
    setMeta('meta[property="og:title"]', "content", fullTitle);
    setMeta('meta[name="twitter:title"]', "content", fullTitle);
    setMeta('meta[property="og:type"]', "content", type);
    if (ogImage) {
      setMeta('meta[property="og:image"]', "content", ogImage);
      setMeta('meta[name="twitter:image"]', "content", ogImage);
    }
    if (canonical) {
      setMeta('link[rel="canonical"]', "href", canonical);
      setMeta('meta[property="og:url"]', "content", canonical);
    }

    return () => {
      document.title = prevTitle;
    };
  }, [title, description, ogImage, canonical, type]);

  return null;
}
