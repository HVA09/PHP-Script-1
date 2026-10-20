import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  canonical?: string;
  type?: "website" | "product" | "article";
  noIndex?: boolean;
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
  description = "DealHub — your global affiliate marketplace for the best deals on electronics, fashion, home goods, and more.",
  keywords,
  image = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80",
  canonical,
  type = "website",
  noIndex = false,
}: SEOProps) {
  useEffect(() => {
    const siteName = "DealHub";
    const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
    document.title = fullTitle;

    setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);

    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:type", type, true);
    setMeta("og:site_name", siteName, true);
    setMeta("og:image", image, true);
    if (canonical) setMeta("og:url", canonical, true);

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
    setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");

    if (canonical) {
      setLink("canonical", canonical);
    }
  }, [title, description, keywords, image, canonical, type, noIndex]);
}
