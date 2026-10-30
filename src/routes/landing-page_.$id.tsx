import { createFileRoute, Link , useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import { toast } from "sonner";
import { MobileMenu } from "@/components/MobileMenu";
import { NavSearch } from "@/components/NavSearch";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { absoluteUrl, breadcrumbLd, DEFAULT_OG_IMAGE, SITE_NAME, truncate } from "@/lib/seo";

export const Route = createFileRoute("/landing-page_/$id")({
  component: LandingPage,
  loader: async ({ params }) => {
    try {
      const res = await fetch(`https://backend.buyersbulletin.com/api/stores?id=${params.id}`);
      const json = await res.json();
      return { store: json.success ? json.data : null };
    } catch (error) {
      console.error(error);
      return { store: null };
    }
  },
  head: ({ loaderData, params }) => {
    const store = loaderData?.store;
    const storeName = store?.name ?? "This Store";
    const canonical = absoluteUrl(`/landing-page/${params.id}`);
    const image = store?.logo_url || DEFAULT_OG_IMAGE;

    const title = truncate(
      store?.meta_title ?? `${storeName} Coupons & Promo Codes | ${SITE_NAME}`,
      60,
    );
    const description = truncate(
      store?.meta_description ??
        store?.description ??
        `Hand-tested ${storeName} coupons, promo codes and deals, verified and updated daily.`,
      160,
    );
    const keywords = store?.meta_keywords;

    const meta: Array<Record<string, unknown>> = [
      { title },
      { name: "description", content: description },
      ...(keywords ? [{ name: "keywords", content: keywords }] : []),
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: image },
      { property: "og:url", content: canonical },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      {
        "script:ld+json": breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Stores", path: "/stores" },
          { name: storeName, path: `/landing-page/${params.id}` },
        ]),
      },
    ];

    if (store?.questions?.length > 0) {
      meta.push({
        "script:ld+json": {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: store.questions.map((question: string, i: number) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: {
              "@type": "Answer",
              text: store.answers?.[i] ?? "",
            },
          })),
        },
      });
    }

    return { meta, links: [{ rel: "canonical", href: canonical }] };
  },
});




type Tag = "Popular" | "Expiring Soon" | "New" | "Free Shipping" | "Sitewide";
type CouponType = "code" | "deal";

type Coupon = {
  id: string;
  title: string;
  description: string;
  code?: string;
  hasCode: boolean; // true only when type is "code" AND the code field looks like a real code
  type: CouponType;
  verified: boolean;
  uses: number;
  tags: Tag[];
  expiresAt: number; // ms timestamp, from API's "expire" date
  addedAt: number; // ms timestamp, from API's "created_at"
  orderBy: number; // from API's "order_by", used for sort order
  discount: string; // display badge, derived from title/code text since API has no discount field
  discountValue: number; // numeric % or $ amount parsed from title/code, 0 if none found
  url: string; // from API's "affiliate_url"
};

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const MERCHANT_URL = "https://theshoppinghabit.com";

// Google Ads "Outbound click" conversion — only fires here, since this is
// the only page with buy/get-code buttons. Not loaded globally in index.html.
function reportOutboundConversion() {
  (window as any).gtag?.("event", "conversion", {
    send_to: "AW-18399768594/wb2qCJ3TsvocEJLg2MVE",
    value: 1.0,
    currency: "PKR",
  });
}

function useCountdown(target: number) {
  const [diff, setDiff] = useState(() => Math.max(0, target - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setDiff(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);
  const d = Math.floor(diff / DAY);
  const h = Math.floor((diff % DAY) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { d, h, m, s, expired: diff === 0 };
}

function Countdown({ target, compact = false }: { target: number; compact?: boolean }) {
  const { d, h, m, s, expired } = useCountdown(target);
  if (expired) return <span className="text-xs font-mono text-red-500">Expired</span>;
  const cell = (v: number, label: string) => (
    <span className="inline-flex flex-col items-center">
      <span className={`font-mono tabular-nums ${compact ? "text-xs" : "text-sm"} font-bold`}>
        {String(v).padStart(2, "0")}
      </span>
      <span className="text-[9px] uppercase tracking-widest opacity-70">{label}</span>
    </span>
  );
  return (
    <div className="inline-flex items-center gap-2">
      {d > 0 && cell(d, "d")}
      {cell(h, "h")}
      {cell(m, "m")}
      {cell(s, "s")}
    </div>
  );
}

// A countdown that never shows "Expired" — once it hits zero it immediately
// starts a fresh period-length countdown again, on repeat, forever.
// The window is anchored to the epoch (not to page-load time), so it resets
// at the same moment for every visitor rather than restarting per-session.
function useRollingCountdown(periodMs: number) {
  const nextBoundary = () => Math.ceil((Date.now() + 1) / periodMs) * periodMs;
  const [target, setTarget] = useState(nextBoundary);
  const [diff, setDiff] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      if (now >= target) {
        setTarget(nextBoundary());
        return;
      }
      setDiff(Math.max(0, target - now));
    }, 1000);
    return () => clearInterval(id);
  }, [target, periodMs]);

  const d = Math.floor(diff / DAY);
  const h = Math.floor((diff % DAY) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { d, h, m, s };
}

function RollingCountdown({ periodMs, compact = false }: { periodMs: number; compact?: boolean }) {
  const { d, h, m, s } = useRollingCountdown(periodMs);
  const cell = (v: number, label: string) => (
    <span className="inline-flex flex-col items-center">
      <span className={`font-mono tabular-nums ${compact ? "text-xs" : "text-sm"} font-bold`}>
        {String(v).padStart(2, "0")}
      </span>
      <span className="text-[9px] uppercase tracking-widest opacity-70">{label}</span>
    </span>
  );
  return (
    <div className="inline-flex items-center gap-2">
      {d > 0 && cell(d, "d")}
      {cell(h, "h")}
      {cell(m, "m")}
      {cell(s, "s")}
    </div>
  );
}

function tagStyle(tag: Tag) {
  switch (tag) {
    case "Popular":
      return "bg-pop/20 text-ink ring-1 ring-pop/40";
    case "Expiring Soon":
      return "bg-brand/15 text-brand ring-1 ring-brand/30";
    case "New":
      return "bg-mint/25 text-ink ring-1 ring-mint/40";
    case "Free Shipping":
      return "bg-mint/20 text-ink ring-1 ring-mint/40";
    case "Sitewide":
      return "bg-foreground/10 text-foreground ring-1 ring-foreground/15";
  }
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  const handleClick = () => {
    if (coupon.hasCode && coupon.code) {
      navigator.clipboard?.writeText(coupon.code).catch(() => {});
      toast.success("Code copied to clipboard", { description: coupon.code });
    } else {
      toast.success("Opening deal…");
    }
    reportOutboundConversion();
    window.open(coupon.url, "_blank", "noopener,noreferrer");
  };

  const highlight =
    coupon.discount !== "CODE" && coupon.discount !== "DEAL"
      ? coupon.discount
      : coupon.title.split(" ").slice(0, 2).join(" ");

  return (
    <article className="group flex rounded-sm border border-foreground/10 bg-background overflow-hidden hover:border-brand/40 transition-colors">
      <div className="w-24 sm:w-28 shrink-0 bg-brand-soft flex items-center justify-center p-2 text-center">
        <span className="text-base sm:text-lg font-bold tracking-tight text-brand leading-tight">
          {highlight}
        </span>
      </div>
      <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 bg-ink text-cream rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">
            {coupon.hasCode ? "Code" : "Deal"}
          </span>
          {coupon.verified && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-mint">✓ Verified</span>
          )}
        </div>
        <h3 className="text-sm font-semibold leading-snug line-clamp-2">{coupon.title}</h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-[10px] text-muted-foreground">
            Exp. {new Date(coupon.expiresAt).toISOString().slice(0, 10)}
          </span>
          <button
            onClick={handleClick}
            className="text-[10px] font-bold uppercase tracking-widest text-brand hover:underline shrink-0"
          >
            {coupon.hasCode ? "Get Code" : "Details"} +
          </button>
        </div>
      </div>
    </article>
  );
}

// Extracts a display discount ("15% OFF", "$15 OFF") and numeric value from
// whatever text is available, since the API has no dedicated discount field.
function extractDiscount(text: string, type: CouponType): { label: string; value: number } {
  const pctMatch = text.match(/(\d+)\s?%/);
  if (pctMatch) return { label: `${pctMatch[1]}% OFF`, value: Number(pctMatch[1]) };
  const dollarMatch = text.match(/\$(\d+)/);
  if (dollarMatch) return { label: `$${dollarMatch[1]} OFF`, value: Number(dollarMatch[1]) };
  return { label: type === "code" ? "CODE" : "DEAL", value: 0 };
}

// Normalizes a coupon record from https://backend.buyersbulletin.com/api/coupons
// into the shape the UI renders.
function normalizeCoupon(raw: any, fallbackIndex: number, merchantUrl: string): Coupon {
  const title: string = raw.title ?? "Special offer";
  const type: CouponType = raw.type === "code" || raw.type === "deal" ? raw.type : "deal";

  // Some records have junk (spaces/descriptions) in the code field even when
  // type is "code" — only treat it as a real, copyable code if it looks like one.
  const rawCode = typeof raw.code === "string" ? raw.code.trim() : "";
  const looksLikeRealCode = rawCode.length > 0 && rawCode.length <= 30 && !/\s/.test(rawCode);
  const hasCode = type === "code" && looksLikeRealCode;

  const { label: discount, value: discountValue } = extractDiscount(`${title} ${rawCode}`, type);

  const expireMs = raw.expire ? new Date(raw.expire).getTime() : NaN;
  const createdMs = raw.created_at ? new Date(raw.created_at).getTime() : NaN;

  return {
    id: String(raw.id ?? fallbackIndex),
    title,
    description: raw.description ?? "",
    code: hasCode ? rawCode : undefined,
    hasCode,
    type,
    verified: true,
    uses: Number(raw.used ?? 0) || 0,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    expiresAt: Number.isFinite(expireMs) ? expireMs : now + 30 * DAY,
    addedAt: Number.isFinite(createdMs) ? createdMs : now,
    orderBy: Number(raw.order_by ?? fallbackIndex),
    discount,
    discountValue,
    url: raw.affiliate_url || merchantUrl,
  };
}

function LandingPage() {
  const { id } = Route.useParams();
  const { store: loaderStore } = Route.useLoaderData();

  const [store, setStore] = useState<any>(loaderStore);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [storeRes, couponRes] = await Promise.all([
          fetch(`https://backend.buyersbulletin.com/api/stores?id=${id}`),
          fetch(`https://backend.buyersbulletin.com/api/coupons?store_id=${id}`),
        ]);

        const storeJson = await storeRes.json();
        const couponJson = await couponRes.json();

        if (storeJson.success) {
          setStore(storeJson.data);
        }

        if (couponJson.success) {
          setCoupons(couponJson.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Store/merchant info: falls back to a generic label while loading
  // or if the API has no data for this id yet.
  const storeName: string = store?.name ?? "This Store";
  const pageTitle: string =
    store?.meta_title ?? `${storeName} Coupons & Promo Codes`;
  const merchantUrl: string = store?.url ?? MERCHANT_URL;
  const merchantDomain = merchantUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  // Coupons: entirely from the API — sorted by the store's own order_by field.
  const sorted = useMemo(() => {
    return coupons
      .map((c, i) => normalizeCoupon(c, i, merchantUrl))
      .sort((a, b) => a.orderBy - b.orderBy);
  }, [coupons, merchantUrl]);

  const bestDeal = sorted[0];

  const grabBestDeal = () => {
    if (!bestDeal) return;
    if (bestDeal.hasCode && bestDeal.code) {
      navigator.clipboard?.writeText(bestDeal.code).catch(() => {});
      toast.success("Code copied to clipboard", { description: bestDeal.code });
    } else {
      toast.success("Opening deal…");
    }
    reportOutboundConversion();
    window.open(bestDeal.url, "_blank", "noopener,noreferrer");
  };

  const [filterTab, setFilterTab] = useState<"all" | "codes" | "deals" | "verified">("all");
  const codesCount = sorted.filter((c) => c.hasCode).length;
  const dealsCount = sorted.filter((c) => !c.hasCode).length;
  const verifiedCount = sorted.filter((c) => c.verified).length;
  const visibleCoupons = sorted.filter((c) => {
    if (filterTab === "codes") return c.hasCode;
    if (filterTab === "deals") return !c.hasCode;
    if (filterTab === "verified") return c.verified;
    return true;
  });

  const filterTabs = [
    { key: "all" as const, label: "All", count: sorted.length },
    { key: "codes" as const, label: "Codes", count: codesCount },
    { key: "deals" as const, label: "Deals", count: dealsCount },
    { key: "verified" as const, label: "Verified", count: verifiedCount },
  ];

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-background border-b-2 border-brand py-3 sm:py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-3 overflow-visible">
        <Link to="/" className="flex items-center shrink-0">
          <Logo />
        </Link>
        <div className="hidden md:flex gap-8">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="text-xs font-bold uppercase tracking-widest transition-colors relative pb-1"
            activeProps={{ className: "text-foreground after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[2px] after:bg-brand" }}
            inactiveProps={{ className: "text-foreground/50 hover:text-foreground" }}
          >
            Home
          </Link>
          <Link
            to="/blog"
            className="text-xs font-bold uppercase tracking-widest transition-colors relative pb-1"
            activeProps={{ className: "text-foreground after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[2px] after:bg-brand" }}
            inactiveProps={{ className: "text-foreground/50 hover:text-foreground" }}
          >
            Blogs
          </Link>
          <Link
            to="/products"
            className="text-xs font-bold uppercase tracking-widest transition-colors relative pb-1"
            activeProps={{ className: "text-foreground after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[2px] after:bg-brand" }}
            inactiveProps={{ className: "text-foreground/50 hover:text-foreground" }}
          >
            Shop
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <NavSearch />
        </div>
        <MobileMenu />
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>→</span>
        <Link to="/stores" className="hover:text-foreground transition-colors">Stores</Link>
        <span>→</span>
        <span className="text-foreground font-medium">{storeName}</span>
      </div>

      {/* Main: deal grid + sidebar */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10">
          {/* Deal grid */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              {store?.description ??
                `Save more at ${storeName}. Every code is hand-verified by our team within the last 24 hours.`}
            </p>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-sm border border-foreground/10 bg-foreground/5 animate-pulse" />
                ))}
              </div>
            ) : visibleCoupons.length > 0 ? (
              <div id="coupons" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visibleCoupons.map((c) => (
                  <CouponCard key={c.id} coupon={c} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center border border-dashed border-foreground/15 rounded-sm">
                No {filterTab === "all" ? "" : filterTab + " "}offers for {storeName} right now — check back soon.
              </p>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24 self-start">
            <div className="rounded-sm border border-foreground/10 bg-background p-5 text-center">
              {store?.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={`${storeName} logo`}
                  className="h-12 mx-auto object-contain mb-4"
                  loading="lazy"
                />
              ) : (
                <p className="text-lg font-bold tracking-tight mb-4">{storeName}</p>
              )}
              <h2 className="text-sm font-bold uppercase tracking-widest mb-2">
                {storeName} Coupons & Promo Codes
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {store?.description ?? `${storeName} offers quality products with the best discounts and special offers available on our site.`}
              </p>
            </div>

            <div className="rounded-sm border border-foreground/10 overflow-hidden">
              {filterTabs.map((t) => {
                const active = filterTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setFilterTab(t.key)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border-b border-foreground/10 last:border-b-0 transition-colors ${
                      active ? "bg-ink text-cream font-semibold" : "text-foreground/70 hover:bg-foreground/5"
                    }`}
                  >
                    <span>{active ? "✓ " : ""}{t.label}</span>
                    <span className={active ? "text-cream/60" : "text-muted-foreground"}>({t.count})</span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-sm border border-foreground/10 bg-background p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">
                About {storeName}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {store?.description ??
                  `${storeName} offers a range of products designed to suit different needs. Visit ${merchantDomain} to find the best discounts and special offers on selected products.`}
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
        <div className="rounded-sm border border-foreground/10 bg-brand-soft p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight mb-4">
            Sign up today for free {storeName} coupons and promo codes
          </h2>
          {newsletterDone ? (
            <p className="text-sm font-semibold text-brand">Subscribed — check your inbox.</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setNewsletterDone(true);
              }}
              className="max-w-xl"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 rounded-sm border border-foreground/15 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
                <button
                  type="submit"
                  className="rounded-sm bg-ink text-cream px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-[filter]"
                >
                  Subscribe
                </button>
              </div>

              <label className="mt-3 flex items-start gap-2 text-xs text-foreground/80">
                <input type="checkbox" required className="mt-0.5 size-3.5 accent-brand" />
                <span>I consent to receiving marketing emails from TheShoppingHabit</span>
              </label>

              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                Subscribe to TheShoppingHabit's Newsletter for personalized offers based on your
                shopping preferences on our website as described in the{" "}
                <Link to="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
                  Privacy Policy
                </Link>
                . You can unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      {store?.questions?.length > 0 && (
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand">FAQs</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2">Frequently Asked Questions</h2>
              <p className="text-muted-foreground mt-3">
                Find answers to the most common questions about {store?.name}.
              </p>
            </div>
            <div className="space-y-4">
              {store.questions.map((question: string, index: number) => (
                <details
                  key={index}
                  className="group rounded-sm border border-foreground/10 bg-background p-5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-lg">
                    {question}
                    <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <div className="mt-4 border-t pt-4 text-muted-foreground leading-7">
                    {store.answers?.[index]}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer showNewsletter />

      {/* Floating mobile CTA */}
      <a
        href="#coupons"
        className="md:hidden fixed bottom-4 inset-x-4 z-40 inline-flex items-center justify-center gap-2 rounded-sm bg-ink text-cream font-bold py-3.5 text-sm uppercase tracking-widest shadow-lg"
      >
        🎟️ Grab a coupon
      </a>
    </div>
  );
}
