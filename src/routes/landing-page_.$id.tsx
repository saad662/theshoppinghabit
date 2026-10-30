import { createFileRoute, Link , useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import { toast } from "sonner";
import { MobileMenuLegacy as MobileMenu } from "@/components/MobileMenuLegacy";
import { NavSearch } from "@/components/NavSearch";
import { FooterLegacy as Footer } from "@/components/FooterLegacy";
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
const MERCHANT_URL = "https://collarsandco.com";

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

function CouponCard({
  coupon,
}: {
  coupon: Coupon;
}) {
  const [revealed, setRevealed] = useState(false);
  const isExpiringSoon = coupon.expiresAt - now < 2 * DAY;

  const handleClick = () => {
    if (coupon.hasCode && coupon.code) {
      navigator.clipboard?.writeText(coupon.code).catch(() => {});
      toast.success("Code copied to clipboard", { description: coupon.code });
      setRevealed(true);
    } else {
      toast.success("Opening deal…");
    }
    reportOutboundConversion();
    window.open(coupon.url, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="coupon-card group relative flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch rounded-2xl border border-foreground/10 bg-background p-4 sm:p-5 shadow-sm overflow-hidden">
      <div className="coupon-notch sm:w-32 shrink-0 flex sm:flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-brand/15 to-pop/15 ring-1 ring-brand/25 p-4 text-center transition-transform duration-500 group-hover:scale-[1.04] group-hover:rotate-[-2deg]">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand">
          Deal
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-ink/70">
          {coupon.type === "code" ? "Promo Code" : "Deal"}
        </span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {coupon.verified && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand">
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 10-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </span>
          )}
          {coupon.tags.map((t) => (
            <span
              key={t}
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${tagStyle(t)}`}
            >
              {t}
            </span>
          ))}
        </div>
        <h3 className="text-base sm:text-lg font-semibold leading-snug text-foreground">{coupon.title}</h3>
        {coupon.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{coupon.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground mt-1">
          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-mint" />
            {coupon.uses.toLocaleString()} used
          </span>
          {isExpiringSoon && (
            <span className="inline-flex items-center gap-1 text-brand font-semibold">
              Ends in <Countdown target={coupon.expiresAt} compact />
            </span>
          )}
        </div>
      </div>

      <div className="sm:w-36 flex sm:flex-col items-center justify-center">
        <button
          onClick={handleClick}
          aria-label={coupon.hasCode ? "Get code" : "Get deal"}
          className="ticket-btn group/tk relative inline-flex items-center gap-2 rounded-full bg-ink text-cream pl-3 pr-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] shadow-[0_8px_20px_-10px_oklch(0.16_0.02_60/.6)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
        >
          <span className="ticket-dot" aria-hidden />
          <span className="relative z-10">{coupon.hasCode ? "Get Code" : "Get Deal"}</span>
          <span aria-hidden className="relative z-10 inline-block transition-transform duration-300 group-hover/tk:translate-x-0.5">→</span>
          {/* Blurred code chip that slides out on hover */}
          {coupon.hasCode && (
            <span
              aria-hidden
              className="ticket-chip pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 translate-y-1 opacity-0 rotate-[-4deg] rounded-md bg-[var(--gradient-shop)] text-ink font-mono text-[10px] font-extrabold tracking-[0.3em] px-2.5 py-1 shadow-md transition-all duration-300 ease-out group-hover/tk:opacity-100 group-hover/tk:translate-y-0 group-hover/tk:rotate-[-2deg] uppercase"
            >
              <span className="blur-[2.5px] select-none">{coupon.code}</span>
            </span>
          )}
        </button>
      </div>
    </article>
  );
}

function BestDealCard({
  title,
  description,
  code,
  hasCode,
  discount,
  onGrab,
}: {
  title: string;
  description: string;
  code?: string;
  hasCode: boolean;
  discount: string;
  onGrab: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rx = ((y / r.height) - 0.5) * -10;
    const ry = ((x / r.width) - 0.5) * 12;
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--mx", `${(x / r.width) * 100}%`);
    el.style.setProperty("--my", `${(y / r.height) * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="tilt-card group relative rounded-3xl bg-ink text-cream p-6 sm:p-8 shadow-[var(--shadow-pop)] overflow-hidden will-change-transform"
    >
      <div className="absolute -top-10 -right-10 size-40 bg-brand/40 rounded-full blur-2xl animate-blob transition-transform duration-700 ease-out group-hover:scale-150 group-hover:-translate-x-8 group-hover:translate-y-6" aria-hidden />
      <div className="absolute -bottom-16 -left-10 size-48 bg-pop/30 rounded-full blur-3xl animate-blob transition-transform duration-700 ease-out group-hover:scale-150 group-hover:translate-x-10 group-hover:-translate-y-8" aria-hidden />
      <span className="tilt-glow" aria-hidden />

      <div className="relative" style={{ transform: "translateZ(40px)" }}>
        <span className="inline-flex items-center gap-2 bg-pop text-pop-foreground rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
          <span className="size-1.5 rounded-full bg-ink animate-pulse" />
          Best Deal Today
        </span>
        <div className="mt-5 flex items-end gap-3">
          <span className="relative text-6xl sm:text-7xl font-extrabold leading-none bg-gradient-to-br from-cream via-pop to-brand bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            {discount}
          </span>
        </div>
        <p className="mt-3 text-lg font-semibold">{title}</p>
        {description && <p className="text-sm opacity-90 mt-1">{description}</p>}
        <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold bg-white/15 backdrop-blur rounded-full px-3 py-1.5 ring-1 ring-white/20">
          ⏳ Ends in <RollingCountdown periodMs={7 * DAY} compact />
        </div>

        <button
          onClick={onGrab}
          className="ticket-btn group/tk mt-8 sm:mt-10 inline-flex items-center gap-2 rounded-full bg-cream text-ink px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
        >
          <span className="ticket-dot" aria-hidden />
          <span className="relative z-10">{hasCode ? "Get Code" : "Get Deal"}</span>
          <span aria-hidden className="relative z-10 inline-block transition-transform duration-300 group-hover/tk:translate-x-0.5">→</span>
          {hasCode && (
            <span
              aria-hidden
              className="ticket-chip pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 translate-y-1 opacity-0 rotate-[-4deg] rounded-md bg-[var(--gradient-shop)] text-ink font-mono text-[10px] font-extrabold tracking-[0.3em] px-2.5 py-1 shadow-md transition-all duration-300 ease-out group-hover/tk:opacity-100 group-hover/tk:translate-y-0 group-hover/tk:rotate-[-2deg] uppercase"
            >
              <span className="blur-[2.5px] select-none">{code}</span>
            </span>
          )}
        </button>
      </div>
    </div>
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

  return (
    <div className="legacy-coupon-palette min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-foreground/5 py-2 sm:py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-3 overflow-visible">
        <Link to="/" className="flex items-center shrink-0">
          <img
            src="/logo.png"
            alt="Buyers Bulletin"
            width={220}
            height={74}
            className="w-[220px] h-auto object-contain block"
          />
        </Link>
        <div className="hidden md:flex gap-8">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="text-base font-medium transition-colors"
            activeProps={{ className: "text-foreground" }}
            inactiveProps={{ className: "text-foreground/70 hover:text-foreground" }}
          >
            Home
          </Link>
          <Link
            to="/blog"
            className="text-base font-medium transition-colors"
            activeProps={{ className: "text-foreground" }}
            inactiveProps={{ className: "text-foreground/70 hover:text-foreground" }}
          >
            Blogs
          </Link>
          <Link
            to="/products"
            className="text-base font-medium transition-colors"
            activeProps={{ className: "text-foreground" }}
            inactiveProps={{ className: "text-foreground/70 hover:text-foreground" }}
          >
            Shop
          </Link>
          <Link
            to="/stores"
            className="text-base font-medium transition-colors"
            activeProps={{ className: "text-foreground" }}
            inactiveProps={{ className: "text-foreground/70 hover:text-foreground" }}
          >
            Stores
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <NavSearch />
        </div>
        <MobileMenu />
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-foreground/5">
        <div className="absolute inset-0 bg-[var(--gradient-cream)] opacity-80" aria-hidden />
        <div
          className="absolute -top-32 -right-40 size-[420px] bg-brand/25 blur-3xl rounded-full animate-blob"
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -left-40 size-[420px] bg-pop/25 blur-3xl rounded-full animate-blob"
          aria-hidden
        />
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
  
  <Link
    to="/"
    className="hover:text-foreground transition-colors"
  >
    Home
  </Link>

  <span>→</span>

  <Link
    to="/stores"
    className="hover:text-foreground transition-colors"
  >
    Stores
  </Link>

  <span>→</span>

  <span className="text-foreground font-medium">
    Landing Page
  </span>
</div>
              <span className="inline-flex items-center gap-2 rounded-full bg-mint/25 text-ink px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                <span className="size-1.5 rounded-full bg-brand animate-pulse" />
                Verified & Updated Offers
              </span>
              <h1 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-balance">
                {pageTitle}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl">
                {store?.description ??
                  `Save more at ${storeName}. Every code is hand-verified by our team within the last 24 hours.`}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#coupons"
                  className="inline-flex items-center gap-2 bg-ink text-cream rounded-full px-5 sm:px-6 py-3 text-sm font-bold uppercase tracking-widest shadow-[var(--shadow-pop)] transition-all hover:scale-[1.04]"
                >
                  See all coupons →
                </a>
                <a
                  href="#how-to-use"
                  className="inline-flex items-center gap-2 bg-background border border-foreground/15 hover:border-foreground/40 rounded-full px-5 sm:px-6 py-3 text-sm font-semibold transition-colors"
                >
                  How it works
                </a>
              </div>
            </div>

            {/* Best deal card */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              {loading ? (
                <div className="rounded-3xl bg-ink/90 text-cream p-6 sm:p-8 animate-pulse">
                  <div className="h-5 w-28 rounded-full bg-cream/20" />
                  <div className="h-16 w-40 rounded-lg bg-cream/20 mt-5" />
                  <div className="h-4 w-3/4 rounded bg-cream/20 mt-4" />
                  <div className="h-10 w-32 rounded-full bg-cream/20 mt-8" />
                </div>
              ) : bestDeal ? (
                <BestDealCard
                  title={bestDeal.title}
                  description={bestDeal.description}
                  code={bestDeal.code}
                  hasCode={bestDeal.hasCode}
                  discount={bestDeal.discount}
                  onGrab={grabBestDeal}
                />
              ) : (
                <div className="rounded-3xl bg-ink text-cream p-6 sm:p-8 text-center">
                  <p className="text-sm opacity-90">No active deals right now — check back soon.</p>
                </div>
              )}

              {/* Store logo/picture, from the store API */}
              {loading ? (
                <div className="mt-4 h-20 rounded-xl bg-foreground/5 animate-pulse" />
              ) : store?.logo_url ? (
                <div className="mt-4 rounded-xl border border-foreground/10 bg-background p-4 flex items-center gap-4">
                  <img
                    src={store.logo_url}
                    alt={`${storeName} logo`}
                    className="size-16 sm:size-20 rounded-lg object-contain bg-white ring-1 ring-foreground/5 p-2 shrink-0"
                    loading="lazy"
                  />
                  <p className="text-base font-semibold text-foreground truncate">{storeName}</p>
                </div>
              ) : null}

              {/* Affiliate disclosure — required on every store page, independent of
                  whether the logo loaded, per Google Ads policy compliance. */}
              <p className="mt-4 text-xs text-muted-foreground text-center sm:text-left">
                We are affiliate partners with {storeName} and may earn a commission from
                purchases made through links on this page.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Coupons */}
      <section id="coupons" className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">All coupons & deals</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading offers…" : `${sorted.length} active offer${sorted.length === 1 ? "" : "s"} ready to use`}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-foreground/10 bg-foreground/5 animate-pulse"
              />
            ))
          ) : sorted.length > 0 ? (
            sorted.map((c) => <CouponCard key={c.id} coupon={c} />)
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No active coupons for {storeName} right now — check back soon.
            </p>
          )}
        </div>
      </section>

      {/* How to use */}
      <section id="how-to-use" className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand">3 simple steps</span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mt-2">How to use a coupon</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              icon: "🏷️",
              t: "Pick a coupon",
              d: "Browse verified offers and choose the discount that fits your order.",
            },
            {
              icon: "📋",
              t: "Copy the code",
              d: "Tap Get Code to reveal and auto-copy it to your clipboard.",
            },
            {
              icon: "🛍️",
              t: "Apply at checkout",
              d: `Paste the code on ${merchantDomain} to apply your savings instantly.`,
            },
          ].map((s, i) => (
            <div
              key={s.t}
              className="relative rounded-2xl bg-background border border-foreground/10 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="absolute -top-3 -left-3 size-8 rounded-full bg-brand text-brand-foreground grid place-items-center text-xs font-bold animate-wiggle">
                {i + 1}
              </div>
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-semibold text-lg">{s.t}</h3>
              <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}

      {store?.questions?.length > 0 && (
  <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand">
          FAQs
        </span>

        <h2 className="text-3xl sm:text-4xl font-bold mt-2">
          Frequently Asked Questions
        </h2>

        <p className="text-muted-foreground mt-3">
          Find answers to the most common questions about {store?.name}.
        </p>
      </div>

      <div className="space-y-4">
        {store.questions.map((question: string, index: number) => (
          <details
            key={index}
            className="group rounded-2xl border border-foreground/10 bg-background p-5 shadow-sm"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-lg">
              {question}

              <span className="transition-transform duration-300 group-open:rotate-180">
                ▼
              </span>
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
        className="md:hidden fixed bottom-4 inset-x-4 z-40 inline-flex items-center justify-center gap-2 rounded-full bg-ink text-cream font-bold py-3.5 text-sm uppercase tracking-widest shadow-[var(--shadow-pop)]"
      >
        🎟️ Grab a coupon
      </a>
    </div>
  );
}