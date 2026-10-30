import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileMenu } from "@/components/MobileMenu";
import { NavSearch } from "@/components/NavSearch";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { absoluteUrl, breadcrumbLd, DEFAULT_OG_IMAGE } from "@/lib/seo";

const TITLE = "Terms & Conditions — TheShoppingHabit";
const DESCRIPTION =
  "Read the Terms & Conditions for using TheShoppingHabit, including affiliate disclosure, intellectual property, and prohibited use.";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: DEFAULT_OG_IMAGE },
      { property: "og:url", content: absoluteUrl("/terms") },
      { name: "robots", content: "index, follow" },
      {
        "script:ld+json": breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Terms & Conditions", path: "/terms" },
        ]),
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/terms") }],
  }),
});

const prohibitedUse = [
  "Violate any applicable laws or regulations.",
  "Attempt to gain unauthorized access to the website or its systems.",
  "Distribute malicious software or harmful code.",
  "Copy, scrape, or misuse website content without permission.",
  "Use the website in any way that may damage its functionality or reputation.",
];

const sections = [
  {
    title: "Use of the Website",
    body: "TheShoppingHabit is intended to provide product reviews, buying guides, comparisons, and informational content. You agree to use this website only for lawful purposes and in a manner that does not interfere with its normal operation or other users' experience.",
  },
  {
    title: "Affiliate Disclosure",
    body: "Some links on TheShoppingHabit are affiliate links. If you purchase a product through these links, we may earn a commission at no additional cost to you. This helps us maintain the website and continue publishing free, high-quality content.",
  },
  {
    title: "Intellectual Property",
    body: "All content on TheShoppingHabit, including text, graphics, logos, images, and other materials, is owned by or licensed to us unless otherwise stated. You may not copy, reproduce, distribute, or republish any content without our prior written permission.",
  },
  {
    title: "Third-Party Links",
    body: "Our website may contain links to third-party websites for your convenience. We are not responsible for the content, policies, products, or services offered by these external websites. Your use of any third-party website is at your own discretion.",
  },
  {
    title: "Disclaimer",
    body: "The information published on TheShoppingHabit is provided for general informational purposes only. While we strive to keep our content accurate and up to date, we make no guarantees regarding the completeness, accuracy, or reliability of any information. Product prices, specifications, and availability may change without notice.",
  },
  {
    title: "Limitation of Liability",
    body: "TheShoppingHabit shall not be held responsible for any direct, indirect, incidental, or consequential damages resulting from the use of this website or reliance on the information provided.",
  },
  {
    title: "Changes to These Terms",
    body: "We reserve the right to modify these Terms & Conditions at any time. Any updates will be published on this page. Your continued use of TheShoppingHabit after changes are posted constitutes your acceptance of the revised terms.",
  },
];

function TermsPage() {
  return (
    <main className="bg-background text-foreground selection:bg-foreground/10">
      {/* Top announcement marquee — site-wide creative touch */}
      <div className="relative z-50 bg-ink text-cream py-2 overflow-hidden border-b border-cream/10">
        <div className="flex gap-8 sm:gap-10 whitespace-nowrap animate-[ticker_30s_linear_infinite] text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em]">
          {Array.from({ length: 3 }).map((_, k) => (
            <span key={k} className="flex gap-8 sm:gap-10 items-center shrink-0">
              <span>Verified Reviews</span>
              <span className="text-pop">/</span>
              <span>Exclusive Deals</span>
              <span className="text-pop">/</span>
              <span>Trusted Buying Guides</span>
              <span className="text-pop">/</span>
            </span>
          ))}
        </div>
      </div>

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

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-10 sm:pb-14">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground mb-4 flex flex-wrap items-center gap-2">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-brand">Terms & Conditions</span>
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tighter leading-[0.98] text-balance max-w-3xl">
            Terms & Conditions
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl text-pretty leading-relaxed">
            Welcome to TheShoppingHabit. By accessing or using this website, you agree to comply with
            these Terms & Conditions. If you do not agree with any part of these terms, please
            discontinue using the website.
          </p>
        </div>
      </section>

      {/* Policy sections */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-border">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground mb-10">
            The Details
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10 sm:gap-x-12 sm:gap-y-12">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-3 text-balance">
                  {section.title}
                </h2>
                <p className="text-sm sm:text-base text-foreground/80 leading-relaxed text-pretty">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prohibited use */}
      <section className="px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12">
          <div className="lg:col-span-7">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Prohibited Use
            </p>
            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed text-pretty">
              By using this website, you agree not to:
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {prohibitedUse.map((item, i) => (
                <div
                  key={item}
                  className="rounded-sm border border-foreground/10 bg-foreground/[0.02] p-5 sm:p-6 hover:border-foreground/30 hover:-translate-y-0.5 transition-all"
                >
                  <span className="font-mono text-pop text-xs tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-3 text-sm sm:text-base font-semibold tracking-tight text-pretty">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-sm bg-ink text-cream p-6 sm:p-7 h-full flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-pop mb-3">
                Please Note
              </p>
              <p className="text-lg sm:text-xl font-medium tracking-tight leading-snug">
                Your continued use of TheShoppingHabit after any changes are posted constitutes
                acceptance of the revised terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-border">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 items-end">
          <div className="lg:col-span-7">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Contact Us
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance mb-5 max-w-2xl">
              Questions about these Terms & Conditions?
            </h2>
            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-2xl text-pretty">
              If you have any questions regarding these Terms & Conditions, please contact us at{" "}
              <a
                href="mailto:info@theshoppinghabit.com"
                className="underline underline-offset-4 hover:opacity-60 transition-opacity"
              >
                info@theshoppinghabit.com
              </a>
              .
            </p>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base sm:text-lg font-medium tracking-tight text-pretty">
              Last Updated: July 2026
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
