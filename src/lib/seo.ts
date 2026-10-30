// TODO: confirm the real domain once it's purchased — placeholder for now.
export const SITE_URL = "https://theshoppinghabit.com";
export const SITE_NAME = "TheShoppingHabit";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;

export function absoluteUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean === "/" ? "" : clean}`;
}

/** Trims text to a max length on a word boundary, adding an ellipsis if cut. */
export function truncate(text: string, max: number): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : cut.length)}…`;
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    // No social profiles yet for the new brand — add sameAs entries once
    // TheShoppingHabit's own social accounts exist.
    address: {
      "@type": "PostalAddress",
      streetAddress: "2381 SW 7th St",
      addressLocality: "Miami",
      addressRegion: "FL",
      postalCode: "33135",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: "+1-657-726-9681",
      // TODO: swap for a real @theshoppinghabit.com address once email is set up.
      email: "info@theshoppinghabit.com",
    },
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/**
 * Injects an alt attribute into any <img> tag missing one, and downgrades
 * stray <h1>/</h1> tags to <h2>/</h2> so CMS-authored article HTML never
 * introduces a second H1 or an unlabeled image on the page.
 */
export function sanitizeArticleHtml(html: string, fallbackAlt: string): string {
  if (!html) return html;
  return html
    .replace(/<h1(\s|>)/gi, "<h2$1")
    .replace(/<\/h1>/gi, "</h2>")
    .replace(/<img(?![^>]*\balt=)([^>]*)>/gi, `<img alt="${fallbackAlt.replace(/"/g, "&quot;")}"$1>`);
}
