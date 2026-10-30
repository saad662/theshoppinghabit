import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Logo } from "@/components/Logo";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) || trimmed.length > 255) {
      setError("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");
      setError("");

      const response = await fetch(
        "https://backend.buyersbulletin.com/api/newsletter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: trimmed,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setStatus("success");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Failed to subscribe.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-sm border-2 border-pop bg-pop/10 p-4" role="status" aria-live="polite">
        <p className="text-sm font-semibold text-cream mb-2">Subscribed — check your inbox.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-[11px] font-bold uppercase tracking-widest text-pop underline underline-offset-2"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="newsletter-email"
          type="email"
          required
          autoComplete="email"
          maxLength={255}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setError("");
            }
          }}
          placeholder="you@example.com"
          aria-label="Email address"
          className="min-w-0 flex-1 bg-cream/10 border-2 border-cream/15 rounded-sm px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-pop transition-colors"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 rounded-sm bg-pop text-pop-foreground text-xs font-bold uppercase tracking-widest px-5 py-2.5 hover:brightness-110 transition-[filter] disabled:opacity-50"
        >
          {status === "loading" ? "Joining…" : "Subscribe"}
        </button>
      </div>

      {status === "error" && (
        <p className="text-xs text-destructive mt-2" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

const exploreLinks = [
  { to: "/", label: "Home" },
  { to: "/blog", label: "Blog" },
  { to: "/products", label: "Shop" },
] as const;

const companyLinks = [
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

const legalLinks = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms" },
] as const;

function FooterColumn({ title, links }: { title: string; links: ReadonlyArray<{ to: string; label: string }> }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cream/40 mb-4">{title}</p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-sm text-cream/80 hover:text-cream transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ showNewsletter = false }: { showNewsletter?: boolean }) {
  return (
    <footer id="studio" className="bg-ink text-cream">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12">
          <div className="lg:col-span-4">
            <Logo dark />
            <p className="text-sm text-cream/60 mt-4 max-w-xs">
              You may save with our links, and we may earn a small commission.
            </p>
          </div>

          <div className="lg:col-span-2">
            <FooterColumn title="Explore" links={exploreLinks} />
          </div>
          <div className="lg:col-span-2">
            <FooterColumn title="Company" links={companyLinks} />
          </div>
          <div className="lg:col-span-2">
            <FooterColumn title="Legal" links={legalLinks} />
          </div>

          {showNewsletter && (
            <div className="lg:col-span-12 lg:order-first pb-10 sm:pb-12 border-b-2 border-cream/10 mb-2 sm:mb-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-end">
                <div className="lg:col-span-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-pop mb-3">Newsletter</p>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
                    Smarter buying decisions, in your inbox.
                  </h2>
                </div>
                <div className="lg:col-span-5">
                  <NewsletterForm />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 sm:mt-14 pt-6 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] font-medium text-cream/40 uppercase tracking-widest">
            © 2026 TheShoppingHabit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
