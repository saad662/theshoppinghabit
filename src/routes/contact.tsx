import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from "lucide-react";
import { MobileMenu } from "@/components/MobileMenu";
import { NavSearch } from "@/components/NavSearch";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { absoluteUrl, breadcrumbLd, DEFAULT_OG_IMAGE } from "@/lib/seo";

const TITLE = "Contact TheShoppingHabit | Support & Partnerships";
const DESCRIPTION =
  "Get in touch with the TheShoppingHabit team for product questions, partnerships, or feedback.";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: DEFAULT_OG_IMAGE },
      { property: "og:url", content: absoluteUrl("/contact") },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      {
        "script:ld+json": breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Contact Us", path: "/contact" },
        ]),
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/contact") }],
  }),
});

const contactDetails = [
  {
    icon: MapPin,
    label: "Address",
    value: "2381 SW 7th St, Miami, Florida 33135, USA",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 657 726 9681",
    href: "tel:+16577269681",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@buyersbulletin.com",
    href: "mailto:info@buyersbulletin.com",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "Monday – Saturday: 10AM – 06PM",
  },
];

const otherWays = [
  {
    title: "Product questions",
    body: "Curious about something we've reviewed? Reach out and our team will point you in the right direction.",
    to: "/products",
    cta: "Browse products",
  },
  {
    title: "Partnerships",
    body: "Brand or business looking to collaborate? We'd love to hear what you have in mind.",
    to: "/about",
    cta: "About TheShoppingHabit",
  },
  {
    title: "Latest reads",
    body: "Not ready to reach out? Catch up on our newest guides and reviews first.",
    to: "/blog",
    cta: "Visit the blog",
  },
];

function ContactPage() {
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

      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-foreground/5 py-2 sm:py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-3 overflow-visible">
        <Link to="/" className="flex items-center shrink-0">
          <Logo />
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
      <section className="px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-10 sm:pb-14">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground mb-4 flex flex-wrap items-center gap-2">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-brand">Contact Us</span>
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tighter leading-[0.98] text-balance max-w-3xl">
            Contact Us
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl text-pretty leading-relaxed">
            Questions, feedback, or partnership opportunities? Our team is here to help — reach out
            using any of the details below and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact info */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="max-w-screen-xl mx-auto">
          <div className="rounded-3xl bg-ink text-cream p-6 sm:p-10 md:p-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10 sm:mb-12">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-pop mb-3">
                  Get In Touch
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight max-w-xl text-balance">
                  We're here to help. Whether you have questions, feedback, or inquiries, we'd love
                  to hear from you.
                </h2>
              </div>
              <a
                href="mailto:info@buyersbulletin.com"
                className="inline-flex items-center gap-2 bg-cream text-ink rounded-full px-5 py-3 text-[11px] sm:text-xs font-bold uppercase tracking-widest hover:scale-[1.03] transition-transform shrink-0 self-start md:self-auto"
              >
                Email us <ArrowUpRight className="size-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {contactDetails.map(({ icon: Icon, label, value, href }) => (
                <div
                  key={label}
                  className="rounded-2xl bg-cream/5 border border-cream/10 p-5 sm:p-6 hover:bg-cream/10 transition-colors"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-cream/10 mb-4">
                    <Icon className="size-4 text-pop" />
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cream/50 mb-1.5">
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="text-sm text-cream/90 hover:text-cream transition-colors leading-relaxed"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm text-cream/90 leading-relaxed">{value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Other ways to help */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 border-t border-border pt-12 sm:pt-16">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground mb-10">
            While You're Here
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {otherWays.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="group rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5 sm:p-6 hover:border-foreground/30 hover:-translate-y-0.5 transition-all flex flex-col"
              >
                <h3 className="text-base sm:text-lg font-semibold tracking-tight mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-foreground/70 leading-relaxed text-pretty mb-5 flex-1">
                  {item.body}
                </p>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-brand">
                  {item.cta}
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
