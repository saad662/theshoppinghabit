import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileMenu } from "@/components/MobileMenu";
import { Footer } from "@/components/Footer";
import { absoluteUrl, breadcrumbLd, DEFAULT_OG_IMAGE } from "@/lib/seo";

const TITLE = "About TheShoppingHabit | Our Mission & Team";
const DESCRIPTION =
  "Learn how TheShoppingHabit researches, tests, and recommends products through honest reviews and expert buying guides.";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: DEFAULT_OG_IMAGE },
      { property: "og:url", content: absoluteUrl("/about") },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      {
        "script:ld+json": breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "About Us", path: "/about" },
        ]),
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/about") }],
  }),
});

const whatWeDo = [
  "Product Reviews",
  "Buying Guides",
  "Product Comparisons",
  "Best Product Lists",
  "Latest Product Trends",
];

function AboutPage() {
  return (
    <main className="bg-background text-foreground selection:bg-foreground/10">
      {/* Top announcement marquee — site-wide creative touch */}
      <div className="relative z-50 bg-ink text-cream py-2 overflow-hidden border-b border-cream/10">
        <div className="flex gap-8 sm:gap-10 whitespace-nowrap animate-[ticker_30s_linear_infinite] text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em]">
          {Array.from({ length: 3 }).map((_, k) => (
            <span key={k} className="flex gap-8 sm:gap-10 items-center shrink-0">
              <span>Studio crafted · made in small batches</span>
              <span className="text-pop">/</span>
              <span>Trending · Arc Task Lamp · C-Series Input</span>
              <span className="text-pop">/</span>
              <span>Lifetime repair on all apparatus</span>
              <span className="text-pop">/</span>
            </span>
          ))}
        </div>
      </div>

      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-foreground/5 py-3 sm:py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-3">
        <Link to="/" className="font-semibold tracking-tight text-sm sm:text-base">TheShoppingHabit</Link>
        <div className="hidden md:flex gap-8">
          <Link to="/" activeOptions={{ exact: true }} className="text-sm font-medium transition-colors" activeProps={{ className: "text-foreground" }} inactiveProps={{ className: "text-foreground/70 hover:text-foreground" }}>Home</Link>
          <Link to="/blog" className="text-sm font-medium transition-colors" activeProps={{ className: "text-foreground" }} inactiveProps={{ className: "text-foreground/70 hover:text-foreground" }}>Blogs</Link>
          <Link to="/products" className="text-sm font-medium transition-colors" activeProps={{ className: "text-foreground" }} inactiveProps={{ className: "text-foreground/70 hover:text-foreground" }}>Shop</Link>
          <Link to="/stores" className="text-sm font-medium transition-colors" activeProps={{ className: "text-foreground" }} inactiveProps={{ className: "text-foreground/70 hover:text-foreground" }}>Stores</Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-ink text-cream rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:scale-[1.04] transition-transform"
          >
            ← Home
          </Link>
        </div>
        <MobileMenu />
      </nav>

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-10 sm:pb-14">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground mb-4 flex flex-wrap items-center gap-2">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="opacity-40">/</span>
            <span className="text-brand">About Us</span>
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tighter leading-[0.98] text-balance max-w-3xl">
            About TheShoppingHabit
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl text-pretty leading-relaxed">
            Welcome to TheShoppingHabit, your trusted destination for discovering quality products,
            expert buying guides, and the latest shopping trends.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12">
          <div className="lg:col-span-7">
            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed text-pretty">
              We are dedicated to helping readers make informed purchasing decisions through
              well-researched reviews, product comparisons, and carefully curated recommendations.
              Our content is designed to simplify your shopping experience by highlighting products
              that offer value, performance, and reliability.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-ink text-cream p-6 sm:p-7 h-full flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-pop mb-3">Our Mission</p>
              <p className="text-lg sm:text-xl font-medium tracking-tight leading-snug">
                Accurate, helpful, and up-to-date information that empowers consumers to shop with
                confidence — every buying decision backed by clear research and honest insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-border">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground mb-4">
            What We Do
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl text-balance mb-10">
            At TheShoppingHabit, we publish content created with a focus on quality, accuracy, and a
            better shopping experience.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {whatWeDo.map((item, i) => (
              <div
                key={item}
                className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5 sm:p-6 hover:border-foreground/30 hover:-translate-y-0.5 transition-all"
              >
                <span className="font-mono text-pop text-xs tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-3 text-sm sm:text-base font-semibold tracking-tight">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-border">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 items-end">
          <div className="lg:col-span-7">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Our Commitment
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance mb-5 max-w-2xl">
              Reliable, informative, and reader-focused — always.
            </h2>
            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-2xl text-pretty">
              We are committed to publishing reliable, informative, and reader-focused content. As
              products and markets evolve, we continuously update our content to ensure our readers
              have access to relevant and trustworthy information.
            </p>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base sm:text-lg font-medium tracking-tight text-pretty">
              Thank you for visiting TheShoppingHabit. We look forward to helping you discover
              products worth buying.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
