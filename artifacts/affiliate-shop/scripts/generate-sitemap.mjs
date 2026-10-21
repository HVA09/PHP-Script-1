import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Client } from "pg";

const configuredSiteUrl = (process.env.VITE_SITE_URL || "").trim();
let siteUrl = "";
if (configuredSiteUrl) {
  const parsedSiteUrl = new URL(configuredSiteUrl);
  if (!["http:", "https:"].includes(parsedSiteUrl.protocol) || parsedSiteUrl.pathname !== "/" || parsedSiteUrl.search || parsedSiteUrl.hash) {
    throw new Error("VITE_SITE_URL must be a site origin, such as https://example.com.");
  }
  siteUrl = parsedSiteUrl.origin;
} else {
  console.warn("VITE_SITE_URL is unset; the preview sitemap will use relative paths and robots.txt will omit its Sitemap directive.");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to generate a sitemap that includes product pages.");
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
let productSlugs;
try {
  await client.connect();
  const result = await client.query(
    "SELECT slug FROM products WHERE slug IS NOT NULL AND slug <> '' ORDER BY slug",
  );
  productSlugs = result.rows.map(({ slug }) => String(slug));
} finally {
  await client.end();
}

const staticRoutes = [
  ["/", "daily", "1.0"],
  ["/products", "daily", "0.9"],
  ["/categories", "weekly", "0.8"],
  ["/blog", "weekly", "0.8"],
  ["/about", "monthly", "0.5"],
  ["/contact", "monthly", "0.4"],
  ["/privacy", "yearly", "0.2"],
  ["/terms", "yearly", "0.2"],
];

const blogData = await readFile(resolve(import.meta.dirname, "../src/lib/blogData.ts"), "utf8");
const blogSlugs = [...blogData.matchAll(/^\s*slug:\s*["']([^"']+)["'],?\s*$/gm)]
  .map(([, slug]) => slug);
const routes = [
  ...staticRoutes,
  ...productSlugs.map((slug) => [`/products/${encodeURIComponent(slug)}`, "weekly", "0.7"]),
  ...blogSlugs.map((slug) => [`/blog/${encodeURIComponent(slug)}`, "monthly", "0.6"]),
];
const xmlEscape = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");
const locationFor = (route) => siteUrl ? `${siteUrl}${route}` : route;
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(([route, changefreq, priority]) => `  <url><loc>${xmlEscape(locationFor(route))}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`).join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /profile
Disallow: /alerts
Disallow: /wishlist
Disallow: /compare
${siteUrl ? `Sitemap: ${locationFor("/sitemap.xml")}` : "# Set VITE_SITE_URL before publishing to add an absolute sitemap URL."}
`;

const publicDir = resolve(import.meta.dirname, "../public");
await mkdir(publicDir, { recursive: true });
await writeFile(resolve(publicDir, "sitemap.xml"), xml);
await writeFile(resolve(publicDir, "robots.txt"), robots);
console.log(`Generated sitemap with ${routes.length} URLs (${productSlugs.length} products, ${blogSlugs.length} articles).`);