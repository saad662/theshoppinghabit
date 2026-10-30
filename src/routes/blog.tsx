import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { MobileMenu } from "@/components/MobileMenu";
import { NavSearch } from "@/components/NavSearch";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { absoluteUrl, breadcrumbLd, DEFAULT_OG_IMAGE } from "@/lib/seo";

    interface Blog {
  id: number;
  title: string;
  slug: string;
  image_url: string;
  description: string;
  content: string;
  created_at: string;
}

const blogSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
});

const TITLE = "Blog — All Stories · TheShoppingHabit";
const DESCRIPTION =
  "The full archive of buying guides, reviews, and shopping tips from TheShoppingHabit.";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
  validateSearch: blogSearchSchema,
  head: ({ match }) => {
    const page = (match.search as { page?: number })?.page ?? 1;
    const canonicalPath = page > 1 ? `/blog?page=${page}` : "/blog";
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:image", content: DEFAULT_OG_IMAGE },
        { property: "og:url", content: absoluteUrl(canonicalPath) },
        { name: "twitter:title", content: TITLE },
        { name: "twitter:description", content: DESCRIPTION },
        { name: "twitter:image", content: DEFAULT_OG_IMAGE },
        {
          "script:ld+json": breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        },
      ],
      links: [{ rel: "canonical", href: absoluteUrl(canonicalPath) }],
    };
  },
});

type Filter = "Trending" | "For you" | "Latest" | "Hot";
const filters: Filter[] = ["Trending", "For you", "Latest", "Hot"];

const BLOGS_API_URL = "https://backend.buyersbulletin.com/api/blogs";
const PAGE_SIZE = 10; // main content per page: 1 hero + 3 side-rail + 6 grid (max)
const WIDGET_POOL_SIZE = 9; // 5 for "Most loved" + 4 for "Related to hero"

// The backend paginates /api/blogs. To show 19 *unique* blogs per page (plus
// unique picks for the sidebar/related widgets) we pull every page from the
// API once and do our own pagination/grouping on the client.
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

  // First try asking for a big page in one shot (common Laravel `per_page` override).
  const firstRes = await fetch(`${BLOGS_API_URL}?per_page=100`);
  const firstJson = await firstRes.json();
  let { items, total, lastPage } = parsePage(firstJson);

  // If the API ignored per_page and is still paginating, fetch the rest of the pages.
  if (items.length < total && lastPage > 1) {
    const remainingPages = Array.from({ length: lastPage - 1 }, (_, i) => i + 2);
    const pageResults = await Promise.all(
      remainingPages.map((p) => fetch(`${BLOGS_API_URL}?page=${p}`).then((r) => r.json())),
    );
    pageResults.forEach((pJson) => {
      items = items.concat(parsePage(pJson).items);
    });
  }

  // De-dupe defensively in case any page overlapped.
  const seen = new Set<number>();
  return items.filter((b) => {
    if (seen.has(b.id)) return false;
    seen.add(b.id);
    return true;
  });
}

function BlogPage() {
    const [filter, setFilter] = useState<Filter>("Trending");
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const { page } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await fetchAllBlogs();
        if (!cancelled) setBlogs(all);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

const filteredBlogs = useMemo(() => {
  const q = query.trim().toLowerCase();

  return blogs.filter((blog) => {
    if (!q) return true;

    return (
      blog.title.toLowerCase().includes(q) ||
      blog.description.toLowerCase().includes(q)
    );
  });
}, [blogs, query]);

// Each page claims one exclusive block of blogs — main content (10) + widgets
// (9) — so nothing from a previous page can ever resurface on a later one.
const BLOCK_SIZE = PAGE_SIZE + WIDGET_POOL_SIZE; // 19 unique blogs "consumed" per page

const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / BLOCK_SIZE));
const currentPage = Math.min(Math.max(1, page), totalPages);

const pageBlock = useMemo(
  () => filteredBlogs.slice((currentPage - 1) * BLOCK_SIZE, currentPage * BLOCK_SIZE),
  [filteredBlogs, currentPage],
);

// First 10 of the block: hero + side rail + grid (max 6).
const pageBlogs = pageBlock.slice(0, PAGE_SIZE);
const hero = pageBlogs[0];
const sideRail = pageBlogs.slice(1, 4);
const grid = pageBlogs.slice(4, 10);

// Remaining 9 of the block: sidebar (5) + related (4) — exclusive to this page.
const widgetPool = pageBlock.slice(PAGE_SIZE, BLOCK_SIZE);
const sidebarBlogs = widgetPool.slice(0, 5);
const related = widgetPool.slice(5, 9);

const goToPage = (next: number) => {
  const clamped = Math.max(1, Math.min(totalPages, next));
  navigate({ search: (prev) => ({ ...prev, page: clamped }) });
  if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
};

const previewed =
  blogs.find((p) => String(p.id) === hoverId) ?? null;

const toggleSave = (id: string) =>
  setSaved((s) =>
    s.includes(id)
      ? s.filter((x) => x !== id)
      : [...s, id]
  );

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading Blogs...
    </div>
  );
}
  return (
    <main
      className="min-h-screen bg-background"
      onMouseMove={(e) => setCoords({ x: e.clientX, y: e.clientY })}
    >
      {/* Nav */}
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

      {/* Header / filter rail */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-6 overflow-hidden">
        <div aria-hidden className="absolute -top-32 -right-32 size-[420px] bg-brand/20 blur-3xl rounded-full pointer-events-none" />
        <div aria-hidden className="absolute -bottom-24 -left-24 size-[320px] bg-mint/40 blur-3xl rounded-full pointer-events-none" />
        <div className="relative max-w-screen-xl mx-auto">
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] text-brand mb-4 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-brand animate-pulse" />
            updated weekly
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <h1 className="lg:col-span-7 text-[2.4rem] sm:text-5xl md:text-7xl font-semibold tracking-tighter leading-[0.95] text-balance">
              Discover What's Actually
              <br />
              <span className="italic font-light bg-gradient-to-r from-brand via-pop to-ink bg-clip-text text-transparent">
                worth it.
              </span>
            </h1>
            <div className="lg:col-span-5 lg:pb-3">
              <label className="relative block">
                <span className="sr-only">Search the journal</span>
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
                  </svg>
                </span>
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    navigate({ search: (prev) => ({ ...prev, page: 1 }) });
                  }}
                  placeholder="Search"
                  className="w-full bg-foreground/[0.04] border border-foreground/10 rounded-full pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/40 transition"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      navigate({ search: (prev) => ({ ...prev, page: 1 }) });
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 size-7 grid place-items-center rounded-full bg-foreground/10 hover:bg-foreground/20 text-xs"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </label>
            </div>
          </div>

           {/* Filter pills */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-2.5 sm:gap-3">
            {filters.map((f) => {
              const selected = filter === f;
              const icon =
                f === "Trending" ? "↗" : f === "For you" ? "✦" : f === "Latest" ? "◷" : "🔥";
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  data-cursor="Filter"
                  className={`group inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                    selected
                      ? "bg-ink text-cream scale-[1.04] shadow-[0_12px_30px_-12px_rgba(0,0,0,0.45)]"
                      : "bg-background border border-foreground/10 text-foreground/70 hover:text-ink hover:border-foreground/40 hover:-translate-y-0.5"
                  }`}
                >
                  <span className={`size-7 sm:size-8 grid place-items-center rounded-full text-sm transition-colors ${
                    selected ? "bg-pop text-pop-foreground" : "bg-foreground/5 group-hover:bg-brand/15"
                  }`}>{icon}</span>
                  <span>{f}</span>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* Hero + side rail */}
      {hero && (
        <section className="px-4 sm:px-6 lg:px-8 pb-10">
          <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            <Link
              to="/blog/$slug"
              params={{ slug: hero.slug }}
              data-cursor="Read"
              onMouseEnter={() => setHoverId(String(hero.id))}
              onMouseLeave={() => setHoverId(null)}
              className="lg:col-span-8 group relative overflow-hidden rounded-3xl bg-ink text-cream"
            >
              <div className="relative aspect-[16/10] md:aspect-[16/8] overflow-hidden">
                <img
                  src={hero.image_url}
                  alt={hero.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
                <span className="absolute top-5 left-5 inline-flex items-center gap-2 bg-pop text-pop-foreground rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                  ★ 
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-10">
                <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-cream/70 mb-3">
                  <span>
                    {new Date(hero.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02] mb-4 max-w-3xl text-balance">
                  {hero.title}
                </h2>
                <p className="text-sm sm:text-base text-cream/80 max-w-xl text-pretty mb-5">
                  {hero.description}
                </p>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-cream/70">
                    By <span className="text-cream font-medium">TheShoppingHabit</span></span>
                  <span className="inline-flex items-center gap-2 bg-cream text-ink rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest group-hover:bg-pop group-hover:text-pop-foreground transition-colors">
                    Read story →
                  </span>
                </div>
              </div>
            </Link>

            <div className="lg:col-span-4 grid grid-cols-1 gap-4">
              {sideRail.map((p, i) => (
                <Link
                  key={p.id}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  data-cursor="Read"
                  onMouseEnter={() => setHoverId(String(p.id))}
                  onMouseLeave={() => setHoverId(null)}
                  className="group flex gap-4 p-3 rounded-2xl border border-foreground/10 hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.35)] transition-all bg-background"
                >
                  <div className="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-xl">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    <span className={`absolute top-1.5 left-1.5 size-6 grid place-items-center rounded-full text-[10px] font-mono `}>
                      {String(i + 2).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                        {new Date(p.created_at).toLocaleDateString()}
                      </p>
                      <h3 className="text-sm sm:text-base font-semibold leading-snug tracking-tight line-clamp-2 group-hover:text-brand transition-colors">
                        {p.title}
                      </h3>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground tabular-nums mt-2">
                      ↗ Blog Post
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Marquee divider */}
     {/* <div className="border-y border-foreground/10 bg-foreground/[0.03] overflow-hidden">
        <div className="flex whitespace-nowrap py-3 animate-marquee gap-8 text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="flex items-center gap-8 shrink-0">
              <span className="text-brand">●</span> Trending now
              <span>·</span>
              <span>Variable type isn't a feature</span>
              <span>·</span>
              <span className="text-pop">●</span> Editor's pick
              <span>·</span>
              <span>Ten micro-interactions worth stealing</span>
              <span>·</span>
              <span className="text-mint">●</span> New
              <span>·</span>
              <span>Inside a Tokyo type foundry</span>
              <span>·</span>
            </span>
          ))}
        </div>
      </div>*/}

      {/* Grid + editor's picks rail */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
          <div className="lg:col-span-8">
            <div className="flex items-end justify-between mb-6 sm:mb-8 gap-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
                Fresh off the press
                <span className="ml-2 text-muted-foreground font-mono text-sm">{grid.length}</span>
              </h2>
            </div>

            {pageBlogs.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-foreground/15 rounded-3xl">
                <p className="text-sm text-muted-foreground mb-4">No stories match those filters.</p>
                <button
                  onClick={() => { setQuery(""); navigate({ search: (prev) => ({ ...prev, page: 1 }) }); }}
                  className="inline-flex items-center gap-2 bg-ink text-cream rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest hover:scale-[1.03] transition-transform"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {grid.map((p) => {
                  const isSaved = saved.includes(String(p.id));
                  return (
                    <article
                      key={p.id}
                      onMouseEnter={() => setHoverId(String(p.id))}
                      onMouseLeave={() => setHoverId(null)}
                      className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background hover:border-foreground/30 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(0,0,0,0.4)] transition-all"
                    >
                      <Link to="/blog/$slug" params={{ slug: p.slug }} data-cursor="Read" className="block">
                        <div className="relative aspect-[5/3] overflow-hidden">
                          <img
                            src={p.image_url}
                            alt={p.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                            loading="lazy"
                          />
                          <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest `}>
                            Story
                          </span>
                        </div>
                        <div className="p-5">
                          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
                           {new Date(p.created_at).toLocaleDateString()}
                          </p>
                          <h3 className="text-base sm:text-lg font-semibold tracking-tight leading-snug mb-2 group-hover:text-brand transition-colors">
                            {p.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{p.description}</p>
                          <div className="flex items-center justify-between gap-3 pt-3 border-t border-foreground/10">
                            <span className="flex items-center gap-2 text-[11px]">
                              <span className="size-7 rounded-full bg-foreground/10 grid place-items-center font-mono text-[10px]">
                                BB
                              </span>
                              <span className="text-foreground/80">TheShoppingHabit</span>
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                              ↗ Published Blog
                            </span>
                          </div>
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleSave(String(p.id))}
                        aria-label={isSaved ? "Unsave" : "Save"}
                        className={`absolute bottom-4 right-4 size-9 rounded-full grid place-items-center transition-all ${
                          isSaved
                            ? "bg-brand text-brand-foreground scale-110"
                            : "bg-background/90 backdrop-blur text-ink opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="size-4">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 self-start">
            {sidebarBlogs.length > 0 && (
            <div className="rounded-3xl bg-ink text-cream p-6 sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-pop mb-3">Editor's index</p>
              <h3 className="text-xl font-semibold tracking-tight mb-5">Most loved this month</h3>
              <ol className="space-y-4">
                {sidebarBlogs.map((p, i) => (
                  <li key={p.id}>
                    <Link
                      to="/blog/$slug"
                      params={{ slug: p.slug }}
                      onMouseEnter={() => setHoverId(String(p.id))}
                      onMouseLeave={() => setHoverId(null)}
                      className="group flex gap-3 items-start"
                    >
                      <span className="font-mono text-pop text-xs tabular-nums pt-1">{String(i + 1).padStart(2, "0")}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-cream/50 mb-1">  {new Date(p.created_at).toLocaleDateString()}</p>
                        <p className="text-sm font-medium leading-snug group-hover:text-pop transition-colors line-clamp-2">{p.title}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
            )}

            <div className="rounded-3xl bg-gradient-to-br from-brand/15 via-mint/30 to-pop/20 p-6 sm:p-7 border border-foreground/10">
              {/*<p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand mb-3">Dispatch</p>*/}
              <h3 className="text-xl font-semibold tracking-tight mb-2">A weekly letter, no noise.</h3>
              {/*<p className="text-sm text-foreground/70 mb-4">One essay, two field notes, three objects we found.</p>*/}
              <form
                onSubmit={(e) => { e.preventDefault(); }}
                className="flex gap-2"
              >
                <input
                  type="email"
                  required
                  placeholder="you@studio.com"
                  className="flex-1 bg-background/80 border border-foreground/15 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
                <button className="inline-flex items-center gap-2 bg-ink text-cream rounded-full px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:scale-[1.03] transition-transform">
                  Join
                </button>
              </form>
            </div>

            {saved.length > 0 && (
              <div className="rounded-3xl border border-foreground/10 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand mb-2">Reading list</p>
                <p className="text-sm">
                  <span className="font-mono text-lg text-ink mr-1">{saved.length}</span>
                  saved for later
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* Related to hero */}
      {hero && related.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] text-brand mb-2">
                  Related to
                </p>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
                  Keep reading the thread
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  onMouseEnter={() => setHoverId(String(p.id))}
                  onMouseLeave={() => setHoverId(null)}
                  className="group block rounded-2xl overflow-hidden border border-foreground/10 hover:border-foreground/30 transition-all hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={p.image_url} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <span className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest `}>Published</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold leading-snug line-clamp-2 mb-2 group-hover:text-brand transition-colors">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <div className="max-w-screen-xl mx-auto flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-4 sm:px-5 py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold uppercase tracking-widest hover:border-foreground/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-muted-foreground tabular-nums px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink text-cream px-4 sm:px-5 py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold uppercase tracking-widest hover:scale-[1.03] transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Next →
            </button>
          </div>
        </section>
      )}

      {/* Floating cursor preview */}
      <div
        aria-hidden
        className="hidden lg:block pointer-events-none fixed top-0 left-0 z-40 w-[260px] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl outline-1 outline-black/10 transition-[opacity,transform] duration-300 ease-out"
        style={{
          opacity: previewed ? 1 : 0,
          transform: `translate(${coords.x + 24}px, ${coords.y - 180}px) scale(${previewed ? 1 : 0.9})`,
        }}
      >
        {previewed && (
          <img src={previewed.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
        )}
      </div>

      <Footer />
    </main>
  );
}
