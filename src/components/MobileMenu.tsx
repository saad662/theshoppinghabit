import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/blog", label: "Blogs" },
  { to: "/products", label: "Shop" },
  { to: "/about", label: "About Us" },
] as const;

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center size-10 rounded-full border border-foreground/10 text-foreground hover:bg-foreground/5 transition-colors"
      >
        <Menu className="size-5" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60] md:hidden">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/70 backdrop-blur-md animate-in fade-in"
            />
            <div className="absolute right-0 top-0 h-full w-[82%] max-w-sm bg-background border-l border-foreground/10 shadow-2xl flex flex-col p-6 animate-in slide-in-from-right">
              <div className="flex items-center justify-between mb-10">
                <span className="font-semibold tracking-tight text-sm">TheShoppingHabit</span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center size-10 rounded-full border border-foreground/10 hover:bg-foreground/5 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-4 text-xl font-semibold tracking-tight text-foreground border-b border-foreground/5 hover:text-brand transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <p className="mt-auto text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                © TheShoppingHabit
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
