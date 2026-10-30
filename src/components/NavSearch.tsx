import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X, ArrowLeft, Loader2, ArrowRight } from "lucide-react";

interface Blog {
  id: number;
  title: string;
  slug: string;
  image_url: string;
  description: string;
  created_at: string;
}

const BLOGS_API_URL = "https://backend.buyersbulletin.com/api/blogs";

// Lightweight fetch of the blog catalog for client-side search. Mirrors the
// pagination handling used on the Journal page so results stay in sync.
async function fetchAllBlogs(): Promise<Blog[]> {
  const parsePage = (json: any): { items: Blog[]; total: number; lastPage: number } => {
    const payload = json?.data;
    const items: Blog[] = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
      ? payload
      : Array.isArray(json)
      ? json
      : [];
    const total = payload?.total ?? items.length;
    const lastPage = payload?.last_page ?? 1;
    return { items, total, lastPage };
  };

  const firstRes = await fetch(`${BLOGS_API_URL}?per_page=100`);
  const firstJson = await firstRes.json();
  let { items, total, lastPage } = parsePage(firstJson);

  if (items.length < total && lastPage > 1) {
    const remainingPages = Array.from({ length: lastPage - 1 }, (_, i) => i + 2);
    const pageResults = await Promise.all(
      remainingPages.map((p) => fetch(`${BLOGS_API_URL}?page=${p}`).then((r) => r.json())),
    );
    pageResults.forEach((pJson) => {
      items = items.concat(parsePage(pJson).items);
    });
  }

  const seen = new Set<number>();
  return items.filter((b) => {
    if (seen.has(b.id)) return false;
    seen.add(b.id);
    return true;
  });
}

const MAX_RESULTS = 6;

export function NavSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load the blog catalog lazily, the first time the search is opened.
  useEffect(() => {
    if (!open || fetched) return;
    let cancelled = false;
    setLoading(true);
    fetchAllBlogs()
      .then((all) => {
        if (!cancelled) setBlogs(all);
      })
      .catch((error) => console.error(error))
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setFetched(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, fetched]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Lock body scroll while the full-screen mobile overlay is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    const mq = window.matchMedia("(max-width: 639px)");
    if (mq.matches) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return blogs
      .filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q),
      )
      .slice(0, MAX_RESULTS);
  }, [query, blogs]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function goToSlug(slug: string) {
    close();
    navigate({ to: "/blog/$slug", params: { slug } });
  }

  function viewAll() {
    close();
    navigate({ to: "/blog", search: { page: 1 } });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        goToSlug(results[activeIndex].slug);
      } else if (query.trim()) {
        viewAll();
      }
    }
  }

  const hasQuery = query.trim().length > 0;

  const resultsList = (
    <>
      <ul className="max-h-[360px] overflow-y-auto py-1.5">
        {results.map((blog, i) => (
          <li key={blog.id}>
            <Link
              to="/blog/$slug"
              params={{ slug: blog.slug }}
              onClick={close}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                activeIndex === i ? "bg-foreground/[0.05]" : ""
              }`}
            >
              {blog.image_url ? (
                <img
                  src={blog.image_url}
                  alt={blog.title}
                  className="size-11 shrink-0 rounded-sm object-cover"
                />
              ) : (
                <div className="size-11 shrink-0 rounded-sm bg-foreground/10" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{blog.title}</p>
                {blog.description && (
                  <p className="truncate text-xs text-foreground/50">{blog.description}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={viewAll}
        className="flex w-full items-center justify-between border-t border-foreground/10 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-foreground/70 hover:text-foreground hover:bg-foreground/[0.03] transition-colors"
      >
        View all results
        <ArrowRight className="size-3.5" />
      </button>
    </>
  );

  return (
    <div
      ref={containerRef}
      className={
        open
          ? "fixed inset-0 z-50 flex flex-col bg-background sm:static sm:inset-auto sm:z-auto sm:block sm:bg-transparent"
          : "relative"
      }
    >
      {/* Search bar: full-width top row on mobile, compact pill on desktop */}
      <div
        className={`flex shrink-0 items-center gap-2 border-b transition-all duration-200 sm:rounded-sm sm:border-b-0 sm:px-4 ${
          open
            ? "border-foreground/10 px-4 py-3.5 sm:w-[290px] sm:border sm:border-foreground/15 sm:bg-background sm:py-2.5"
            : "w-10 border-transparent px-0 py-2 sm:w-auto sm:border sm:border-foreground/15 sm:bg-foreground/[0.03] sm:py-2.5"
        }`}
      >
        <button
          type="button"
          aria-label={open ? "Close search" : "Search blogs"}
          onClick={() => (open ? close() : setOpen(true))}
          className="flex shrink-0 items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
        >
          {open ? (
            <>
              <ArrowLeft className="size-5 sm:hidden" />
              <Search className="hidden size-[18px] sm:block" />
            </>
          ) : (
            <Search className="size-[18px]" />
          )}
        </button>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search the journal…"
          aria-label="Search blogs"
          className={`min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/40 outline-none transition-opacity duration-200 ${
            open ? "opacity-100" : "hidden opacity-0 sm:hidden"
          }`}
        />

        {open && query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="flex shrink-0 items-center justify-center text-foreground/40 hover:text-foreground transition-colors"
          >
            <X className="size-4 sm:size-3.5" />
          </button>
        )}
      </div>

      {/* Mobile: results fill the rest of the full-screen overlay */}
      {open && (
        <div className="flex-1 overflow-y-auto sm:hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-foreground/60">
              <Loader2 className="size-4 animate-spin" />
              Searching journal…
            </div>
          ) : hasQuery && results.length > 0 ? (
            resultsList
          ) : hasQuery ? (
            <div className="px-4 py-10 text-center text-sm text-foreground/50">
              No stories found for "{query}"
            </div>
          ) : (
            <div className="px-4 py-10 text-center text-sm text-foreground/40">
              Start typing to search the journal
            </div>
          )}
        </div>
      )}

      {/* Desktop: results drop down below the compact pill */}
      {open && hasQuery && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 hidden w-[320px] max-w-[85vw] overflow-hidden rounded-sm border border-foreground/10 bg-background shadow-xl sm:block">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-foreground/60">
              <Loader2 className="size-4 animate-spin" />
              Searching journal…
            </div>
          ) : results.length > 0 ? (
            resultsList
          ) : (
            <div className="px-4 py-6 text-center text-sm text-foreground/50">
              No stories found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
