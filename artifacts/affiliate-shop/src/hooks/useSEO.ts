import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  canonical?: string;
  type?: "website" | "product" | "article";
  noIndex?: boolean;
  enabled?: boolean;
}

function setMeta(nameOrProp: string, content: string, isProp = false) {
  const attr = isProp ? "property" : "name";
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${nameOrProp}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, nameOrProp);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function useSEO({
  title,
  description = "Discover curated product deals, clear specifications, and retailer links across popular shopping categories with DealHub.",
  keywords,
  image = `${import.meta.env.BASE_URL || "/"}opengraph.jpg`,
  canonical,
  type = "website",
  noIndex = false,
  enabled = true,
}: SEOProps) {
  useEffect(() => {
    if (!enabled) return;

    const siteName = "DealHub";
    const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
    const canonicalUrl = canonical
      ? new URL(canonical, window.location.href).href
      : new URL(window.location.pathname, window.location.origin).href;
    const imageUrl = new URL(image, window.location.href).href;
    document.title = fullTitle;

    setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);

    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:type", type, true);
    setMeta("og:site_name", siteName, true);
    setMeta("og:image", imageUrl, true);
    setMeta("og:image:alt", title, true);
    setMeta("og:url", canonicalUrl, true);

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", imageUrl);
    setMeta("twitter:image:alt", title);
    setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");
    setLink("canonical", canonicalUrl);
  }, [title, description, keywords, image, canonical, type, noIndex, enabled]);
}
