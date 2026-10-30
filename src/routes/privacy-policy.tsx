import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileMenu } from "@/components/MobileMenu";
import { NavSearch } from "@/components/NavSearch";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { absoluteUrl, breadcrumbLd, DEFAULT_OG_IMAGE } from "@/lib/seo";

const TITLE = "Privacy Policy — TheShoppingHabit";
const DESCRIPTION =
  "Learn how TheShoppingHabit collects, uses, and protects your information when you visit our website.";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: DEFAULT_OG_IMAGE },
      { property: "og:url", content: absoluteUrl("/privacy-policy") },
      { name: "robots", content: "index, follow" },
      {
        "script:ld+json": breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy-policy" },
        ]),
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/privacy-policy") }],
  }),
});

const howWeUse = [
  "Improve our website and user experience",
  "Respond to inquiries or support requests",
  "Analyze website performance and content effectiveness",
  "Deliver relevant recommendations and affiliate content",
];

const sections = [
  {
    title: "Information We Collect",
    body: "When you use TheShoppingHabit, certain information may be collected to help improve your browsing experience, website performance, and overall functionality. If you choose to contact us or subscribe to updates, we may also receive the information you voluntarily provide.",
  },
  {
    title: "Cookies",
    body: "TheShoppingHabit may use cookies and similar technologies to enhance website functionality, remember preferences, and improve your browsing experience. You can manage or disable cookies through your browser settings at any time.",
  },
  {
    title: "Email Newsletter Subscription",
    body: "Our email newsletter is optional. Subscribers can sign up to receive updates about deals, discounts, and special offers. You can unsubscribe at any time using the link in our emails. We respect your privacy and handle your information according to this Privacy Policy, which is linked next to the subscription form.",
  },
  {
    title: "Affiliate Disclosure",
    body: "TheShoppingHabit participates in affiliate marketing programs. This means we may earn a commission when you purchase products through certain links on our website, at no additional cost to you. These commissions help support the website and allow us to continue creating helpful content.",
  },
  {
    title: "Third-Party Websites",
    body: "Our website may contain links to external websites. We are not responsible for the privacy practices or content of third-party sites, and we encourage you to review their privacy policies before sharing any personal information.",
  },
  {
    title: "Data Security",
    body: "We use reasonable measures to help protect the information associated with our website. While no online service can guarantee complete security, we continuously work to maintain a safe browsing environment.",
  },
  {
    title: "Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Any changes will be posted on this page along with the revised effective date.",
  },
];

function PrivacyPolicyPage() {
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
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="opacity-40">/</span>
            <span className="text-brand">Privacy Policy</span>
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tighter leading-[0.98] text-balance max-w-3xl">
            Privacy Policy
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl text-pretty leading-relaxed">
            At TheShoppingHabit, we value your privacy and are committed to protecting your personal
            information. This Privacy Policy explains how we handle information when you visit our
            website.
          </p>
        </div>
      </section>

      {/* How we use your info */}
      <section className="px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12">
          <div className="lg:col-span-7">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground mb-4">
              How We Use Your Information
            </p>
            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed text-pretty">
              The information we receive is used to improve our services and support your experience
              on TheShoppingHabit.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {howWeUse.map((item, i) => (
                <div
                  key={item}
                  className="rounded-sm border border-foreground/10 bg-foreground/[0.02] p-5 sm:p-6 hover:border-foreground/30 hover:-translate-y-0.5 transition-all"
                >
                  <span className="font-mono text-pop text-xs tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-3 text-sm sm:text-base font-semibold tracking-tight">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-sm bg-ink text-cream p-6 sm:p-7 h-full flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-pop mb-3">Our Promise</p>
              <p className="text-lg sm:text-xl font-medium tracking-tight leading-snug">
                We do not sell or rent your personal information to third parties.
              </p>
            </div>
          </div>
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

      {/* Contact */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-border">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 items-end">
          <div className="lg:col-span-7">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Contact Us
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance mb-5 max-w-2xl">
              Questions about this Privacy Policy?
            </h2>
            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-2xl text-pretty">
              If you have any questions regarding this Privacy Policy, feel free to contact us at{" "}
              <a href="mailto:info@buyersbulletin.com" className="underline underline-offset-4 hover:opacity-60 transition-opacity">
                info@buyersbulletin.com
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
