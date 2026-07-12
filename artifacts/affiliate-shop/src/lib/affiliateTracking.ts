const TRACKING_SOURCE = "dealhub";
const CLICK_LOG_KEY = "dealhub_affiliate_clicks";

export function buildAffiliateUrl(baseUrl: string, productSlug: string): string {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("utm_source", TRACKING_SOURCE);
    url.searchParams.set("utm_medium", "affiliate");
    url.searchParams.set("utm_campaign", productSlug);
    url.searchParams.set("utm_content", "product-page");
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function trackAffiliateClick(productId: number, productTitle: string, slug: string): void {
  try {
    const existing: unknown[] = JSON.parse(localStorage.getItem(CLICK_LOG_KEY) ?? "[]");
    existing.push({ productId, productTitle, slug, ts: Date.now() });
    localStorage.setItem(CLICK_LOG_KEY, JSON.stringify(existing.slice(-200)));
  } catch {
    // silently fail in private browsing
  }
}

export function getClickStats(): { total: number; today: number } {
  try {
    const data: { ts: number }[] = JSON.parse(localStorage.getItem(CLICK_LOG_KEY) ?? "[]");
    const today = new Date().setHours(0, 0, 0, 0);
    return {
      total: data.length,
      today: data.filter((d) => d.ts >= today).length,
    };
  } catch {
    return { total: 0, today: 0 };
  }
}
