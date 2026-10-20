import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const siteUrl = (process.env.VITE_SITE_URL || "").trim().replace(/\/+$/, "");
const routes = [
  ["/", "daily", "1.0"],
  ["/products", "daily", "0.9"],
  ["/categories", "weekly", "0.8"],
  ["/blog", "weekly", "0.8"],
  ["/about", "monthly", "0.5"],
  ["/contact", "monthly", "0.4"],
  ["/privacy", "yearly", "0.2"],
  ["/terms", "yearly", "0.2"],
];

const locationFor = (route) => siteUrl ? `${siteUrl}${route}` : route;
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(([route, changefreq, priority]) => `  <url><loc>${locationFor(route)}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`).join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /profile
Disallow: /alerts
Disallow: /wishlist
Disallow: /compare
Sitemap: ${locationFor("/sitemap.xml")}
`;

const publicDir = resolve(import.meta.dirname, "../public");
await mkdir(publicDir, { recursive: true });
await writeFile(resolve(publicDir, "sitemap.xml"), xml);
await writeFile(resolve(publicDir, "robots.txt"), robots);