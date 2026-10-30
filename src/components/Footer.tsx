import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";


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
      <div
        className="border-t border-foreground pt-6 animate-fade-up"
        role="status"
        aria-live="polite"
      >
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Subscribed
        </p>
        <p className="text-2xl font-medium tracking-tight mb-4">
          Thank you — check your inbox.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-xs font-medium uppercase tracking-widest underline underline-offset-4 hover:opacity-60 transition-opacity"
        >
          Subscribe another email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="border-t border-foreground pt-6">
      <label
        htmlFor="newsletter-email"
        className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground block mb-3"
      >
        Email Address
      </label>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border-b border-foreground/30 focus-within:border-brand transition-colors">
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
          className="min-w-0 flex-1 bg-transparent py-3 text-lg outline-none placeholder:text-muted-foreground/60"
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 w-full sm:w-auto rounded-full bg-brand text-brand-foreground text-xs font-bold uppercase tracking-widest px-5 py-2.5 mb-3 sm:mb-0 hover:scale-[1.04] transition-transform disabled:opacity-50"
        >
          {status === "loading" ? "Submitting..." : "Subscribe →"}
        </button>
      </div>

      {status === "error" ? (
        <p className="text-xs text-destructive mt-3" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground mt-3">
          Join our newsletter to receive the latest deals and exclusive offers.{" "}
          <Link
            to="/privacy-policy"
            className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2"
          >
            Privacy Policy
          </Link>
        </p>
      )}
    </form>
  );
}
export function Footer({ showNewsletter = false }: { showNewsletter?: boolean }) {
  return (
    <footer id="studio" className="border-t border-border">
      {showNewsletter && (
        <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-border">
          <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 items-end">
            <div className="lg:col-span-6">
              <h2 className="text-[2rem] sm:text-4xl md:text-5xl font-semibold tracking-tight text-balance max-w-[18ch]">
                Smarter buying decisions, in your inbox.
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <NewsletterForm />
            </div>
          </div>
        </section>
      )}
      <div className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto flex flex-col items-center gap-6 sm:gap-8 text-center md:flex-row md:justify-between md:text-left">
          <div className="space-y-2">
            <p className="text-sm sm:text-base font-medium text-[#000000] max-w-xs mx-auto md:mx-0">
              You may save with our links, and we may earn a small commission.
            </p>
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-widest">
              © 2026 TheShoppingHabit. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-3 sm:gap-x-8">
            <Link to="/about" className="text-xs font-medium uppercase tracking-widest">
              About Us
            </Link>
            <Link to="/stores" className="text-xs font-medium uppercase tracking-widest">
              Stores
            </Link>
            <Link to="/privacy-policy" className="text-xs font-medium uppercase tracking-widest">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs font-medium uppercase tracking-widest">
              Terms
            </Link>
            <Link to="/contact" className="text-xs font-medium uppercase tracking-widest">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
