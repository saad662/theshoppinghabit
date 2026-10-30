// Runs as the "postbuild" step (see package.json) so dist/sitemap.xml stays
// in sync with whatever is actually live in the CMS at deploy time — blog
// posts and store pages don't exist as build-time files, so they can only
// be listed here by asking the backend what currently exists.
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SITE_URL = "https://buyersbulletin.com";
const API_BASE = "https://backend.buyersbulletin.com/api";
const DIST_DIR = resolve(process.cwd(), "dist");

const STATIC_PATHS = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/products", priority: "0.9", changefreq: "daily" },
  { path: "/blog", priority: "0.9", changefreq: "daily" },
  { path: "/stores", priority: "0.8", changefreq: "weekly" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/contact", priority: "0.5", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
];

// Mirrors the pagination-shape handling already used by the blog/products
// routes: a plain array, {data: [...]}, or {data: {data: [...]}}.
function extractItems(json) {
  const payload = json?.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(json)) return json;
  return [];
}

async function fetchAllPages(url) {
  try {
    const firstRes = await fetch(`${url}?per_page=100`);
    const firstJson = await firstRes.json();
    let items = extractItems(firstJson);
    const total = firstJson?.data?.total ?? items.length;
    const lastPage = firstJson?.data?.last_page ?? 1;

    if (items.length < total && lastPage > 1) {
      const pages = Array.from({ length: lastPage - 1 }, (_, i) => i + 2);
      const rest = await Promise.all(pages.map((p) => fetch(`${url}?page=${p}`).then((r) => r.json())));
      rest.forEach((json) => items.push(...extractItems(json)));
    }
    return items;
  } catch (error) {
    console.warn(`[sitemap] Failed to fetch ${url}: ${error.message}`);
    return [];
  }
}

function urlEntry(path, { lastmod, changefreq, priority } = {}) {
  const loc = `${SITE_URL}${path === "/" ? "" : path}`;
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

function toDateOnly(value) {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : undefined;
}

async function main() {
  const entries = STATIC_PATHS.map((p) => urlEntry(p.path, p));

  const blogs = await fetchAllPages(`${API_BASE}/blogs`);
  for (const b of blogs) {
    if (!b?.slug) continue;
    entries.push(
      urlEntry(`/blog/${b.slug}`, {
        changefreq: "monthly",
        priority: "0.7",
        lastmod: toDateOnly(b.updated_at || b.created_at),
      }),
    );
  }

  const stores = await fetchAllPages(`${API_BASE}/stores`);
  for (const s of stores) {
    if (s?.id == null) continue;
    entries.push(urlEntry(`/landing-page/${s.id}`, { changefreq: "weekly", priority: "0.6" }));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;

  writeFileSync(resolve(DIST_DIR, "sitemap.xml"), xml, "utf-8");
  console.log(`[sitemap] Wrote sitemap.xml with ${entries.length} URLs (${blogs.length} blog posts, ${stores.length} stores).`);
}

main();
