import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useRef,
  FormEvent,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { MobileMenu } from "@/components/MobileMenu";
import { NavSearch } from "@/components/NavSearch";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { absoluteUrl, breadcrumbLd, DEFAULT_OG_IMAGE } from "@/lib/seo";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";

const TITLE = "All Products — TheShoppingHabit";
const DESCRIPTION =
  "Browse the full TheShoppingHabit catalogue. Filter by category, sort, and search the entire collection of products.";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: DEFAULT_OG_IMAGE },
      { property: "og:url", content: absoluteUrl("/products") },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      {
        "script:ld+json": breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
        ]),
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/products") }],
  }),
});

type Category = "Fashion" | "Tech" | "Beauty" | "Gym" | "Home & Living";

type Product = {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  description: string;
  price: string;
  image: string;
  image_url: string;
  created_at: string;
  category: FilterCategory | "Other";
  categoryLabel: string;
  desc: string;
  materials: string;
  priceNum: number;
  year: string;
  status: string;
  badge?: string;
  swatch: string;
  index: string;
  rating: number;
  reviews: number;
  link: string;
};



const categories = ["All", "Fashion", "Tech", "Beauty", "Gym", "Home & Living"] as const;
type FilterCategory = (typeof categories)[number];

const categoryIcons: Record<FilterCategory, string> = {
  All: "🌟",
  Fashion: "👕",
  Tech: "💻",
  Beauty: "💄",
  Gym: "🏋️",
  "Home & Living": "🏠",
};

// All 6 categories shown as hero feature chips.
const heroCategories: FilterCategory[] = [
  "All",
  "Fashion",
  "Tech",
  "Beauty",
  "Gym",
  "Home & Living",
];

// Quick-filter tags shown in a horizontal scroll bar below the hero.
type QuickTagKey =
  | "all"
  | "bestsellers"
  | "new"
  | "limited"
  | "preorder"
  | "topRated"
  | "under100"
  | "under300"
  | "studioPick"
  | "hot";
const quickTags: { key: QuickTagKey; label: string; match: (p: Product) => boolean }[] = [
  { key: "all", label: "✦  Everything", match: () => true },
  { key: "bestsellers", label: "♛  Bestsellers", match: (p) => p.badge === "Bestseller" },
  { key: "new", label: "✺  New drops", match: (p) => p.badge === "New" },
  { key: "hot", label: "▲  Trending", match: (p) => p.badge === "Hot" },
  { key: "studioPick", label: "◐  Studio picks", match: (p) => p.badge === "Studio Pick" },
  { key: "topRated", label: "★  Top rated 4.8+", match: (p) => p.rating >= 4.8 },
  { key: "limited", label: "◆  Limited", match: (p) => p.status === "Limited" },
  { key: "preorder", label: "✧  Pre-order", match: (p) => p.status === "Pre-Order" },
  { key: "under100", label: "$  Under $100", match: (p) => p.priceNum < 100 },
  { key: "under300", label: "$$ Under $300", match: (p) => p.priceNum < 300 },
];

const materialsTicker = [
  "CURATED PICKS",
  "IN-DEPTH REVIEWS",
  "SMART BUYING TIPS",
  "BEST VALUE PRODUCTS",
  "TRENDING FINDS",
  "EXPERT INSIGHTS",
];

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price ↑" },
  { key: "price-desc", label: "Price ↓" },
  // { key: "rating", label: "Top rated" },
  // { key: "newest", label: "Newest" },
];

function ProductTiltCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`${className ?? ""} transition-transform duration-200 ease-out hover:-translate-y-1`}>
      {children}
    </div>
  );
}

const PRODUCTS_API_URL = "https://backend.buyersbulletin.com/api/products";

// The exact category list from the CMS ("Add Product" category_id dropdown).
const CMS_CATEGORY_NAME_BY_ID: Record<number, string> = {
  18: "Accessories",
  1: "Apparel And Clothing",
  21: "Art & Craft",
  8: "AutoMobile",
  20: "Automotive",
  27: "Babies",
  6: "Bags",
  7: "Bathroom",
  22: "Books",
  13: "Clothing",
  29: "Departmental",
  19: "Electronics",
  9: "Entertainment",
  35: "Fashion",
  24: "Fashion & Beauty",
  17: "Foods & Drinks",
  33: "Footwear",
  25: "Furniture and Decor",
  4: "Gadgets",
  32: "Gifts",
  23: "Gym & Fitness",
  11: "Hardware",
  5: "Health & Wellness",
  10: "Home Appliances",
  28: "Kids",
  3: "Kitchen & Kitchenware",
  31: "Pets",
  14: "Plants",
  26: "Plants",
  2: "Shoes",
  16: "Skincare & Beauty",
  15: "Sports",
  30: "Technology",
  12: "Travel",
};

// Groups every CMS category into one of the 5 top-level shop filters shown on
// the storefront. Categories not listed here only show up under "All".
const CATEGORY_GROUP_BY_ID: Record<number, FilterCategory> = {
  // Fashion
  1: "Fashion", 13: "Fashion", 35: "Fashion", 2: "Fashion", 33: "Fashion", 6: "Fashion", 18: "Fashion",
  // Tech
  19: "Tech", 4: "Tech", 30: "Tech", 11: "Tech", 8: "Tech", 20: "Tech",
  // Beauty
  24: "Beauty", 16: "Beauty", 5: "Beauty",
  // Gym
  23: "Gym", 15: "Gym",
  // Home & Living
  7: "Home & Living", 25: "Home & Living", 10: "Home & Living", 3: "Home & Living",
  14: "Home & Living", 26: "Home & Living", 29: "Home & Living", 17: "Home & Living",
};

const productSwatches = ["bg-white"];

// The CMS only actually stores name/price/link/category_id/image/description —
// everything else here is derived so the rest of the page (filters, sort,
// quick view, search) always has safe values to work with instead of undefined.
function normalizeProduct(raw: any, i: number): Product {
  const categoryId = Number(raw.category_id);
  const group = CATEGORY_GROUP_BY_ID[categoryId] ?? "Other";
  const priceNum =
    typeof raw.price === "number" ? raw.price : parseFloat(String(raw.price).replace(/[^0-9.]/g, "")) || 0;

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug ?? String(raw.id),
    category_id: categoryId,
    category: group,
    categoryLabel: CMS_CATEGORY_NAME_BY_ID[categoryId] ?? "Other",
    description: raw.description ?? "",
    desc: raw.description ?? "",
    price: typeof raw.price === "number" ? `$${raw.price}` : String(raw.price ?? ""),
    priceNum,
    image: raw.image_url || raw.image || "",
    image_url: raw.image_url || raw.image || "",
    created_at: raw.created_at ?? "",
    materials: raw.materials ?? "",
    year: raw.created_at ? String(new Date(raw.created_at).getFullYear()) : String(new Date().getFullYear()),
    status: raw.status ?? "In Stock",
    badge: raw.badge,
    swatch: productSwatches[i % productSwatches.length],
    index: String(i + 1).padStart(2, "0"),
    rating: raw.rating ?? 4.5,
    reviews: raw.reviews ?? 0,
    link: raw.link || "#",
  };
}

// The backend paginates /api/products. Pull every page once on load so
// client-side pagination/filtering/sorting can work across the whole catalogue.
async function fetchAllProducts(): Promise<Product[]> {
  const parsePage = (json: any): { items: any[]; total: number; lastPage: number } => {
    const payload = json?.data;
    const items: any[] = Array.isArray(payload?.data)
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

  // Try asking for a big page in one shot first (common Laravel `per_page` override).
  const firstRes = await fetch(`${PRODUCTS_API_URL}?per_page=200`);
  const firstJson = await firstRes.json();
  let { items, total, lastPage } = parsePage(firstJson);

  // If the API ignored per_page and is still paginating, fetch the rest of the pages.
  if (items.length < total && lastPage > 1) {
    const remainingPages = Array.from({ length: lastPage - 1 }, (_, i) => i + 2);
    const pageResults = await Promise.all(
      remainingPages.map((p) => fetch(`${PRODUCTS_API_URL}?page=${p}`).then((r) => r.json())),
    );
    pageResults.forEach((pJson) => {
      items = items.concat(parsePage(pJson).items);
    });
  }

  // De-dupe defensively in case any page overlapped.
  const seen = new Set<number>();
  const uniqueRaw = items.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  return uniqueRaw.map(normalizeProduct);
}

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);


  const [category, setCategory] = useState<FilterCategory>("All");
  const [sort, setSort] = useState<SortKey>("featured");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<QuickTagKey>("all");
  const [bag, setBag] = useState<number[]>([]);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [bagPing, setBagPing] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        const all = await fetchAllProducts();
        setProducts(all);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    };

    fetchProducts();

  }, []);

  const filtered = useMemo(() => {
    let list = category === "All" ? [...products] : products.filter((p) => p.category === category);
    const tagDef = quickTags.find((t) => t.key === tag);
    if (tagDef) list = list.filter(tagDef.match);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q) ||
          p.materials.toLowerCase().includes(q),
      );
    }
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.priceNum - b.priceNum);
        break;
      case "price-desc":
        list.sort((a, b) => b.priceNum - a.priceNum);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list.sort((a, b) => Number(b.year) - Number(a.year));
        break;
    }
    return list;
  }, [products, category, sort, query, tag]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );
  const goToPage = (p: number) => {
    const next = Math.max(1, Math.min(totalPages, p));
    setPage(next);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const setCategoryAndReset = (c: FilterCategory) => {
    setCategory(c);
    setPage(1);
  };
  const setTagAndReset = (k: QuickTagKey) => {
    setTag(k);
    setPage(1);
  };
  const setSortAndReset = (s: SortKey) => {
    setSort(s);
    setPage(1);
  };
  const setQueryAndReset = (q: string) => {
    setQuery(q);
    setPage(1);
  };

  const addToBag = (id: number) => {
    setBag((b) => [...b, id]);
    setBagPing(true);
    window.setTimeout(() => setBagPing(false), 600);
  };
  const toggleSaved = (id: number) => {
    setSaved((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const [email, setEmail] = useState("");
// const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState("");

const handleNewsletterSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const trimmed = email.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    setError("Please enter a valid email address.");
    return;
  }

  try {
    setLoading(true);
    setError("");
    setMessage("");

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

    setMessage("Thank you! You're subscribed.");
    setEmail("");
  } catch (err: any) {
    setError(err.message || "Failed to subscribe.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top nav */}
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

      {/* Shop: sidebar filters + grid — replaces the old stacked chip/pill/toolbar/marquee bars */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-10">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 self-start space-y-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight mb-1">Shop</h1>
              <p className="text-xs text-muted-foreground">{filtered.length} products</p>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">⌕</span>
              <input
                value={query}
                onChange={(e) => setQueryAndReset(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2.5 rounded-sm bg-foreground/[0.04] border border-foreground/10 text-sm focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Category</p>
              <ul className="space-y-1">
                {heroCategories.map((c) => {
                  const count = c === "All" ? products.length : products.filter((p) => p.category === c).length;
                  const active = c === category;
                  return (
                    <li key={c}>
                      <button
                        onClick={() => setCategoryAndReset(c)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-sm transition-colors ${
                          active
                            ? "bg-ink text-cream font-semibold"
                            : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span aria-hidden>{categoryIcons[c]}</span>
                          {c}
                        </span>
                        <span className={`text-[10px] tabular-nums ${active ? "text-cream/60" : "text-muted-foreground"}`}>
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Quick filters</p>
              <div className="flex flex-wrap gap-1.5">
                {quickTags.map((t) => {
                  const active = t.key === tag;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTagAndReset(t.key)}
                      className={`rounded-sm border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        active
                          ? "bg-ink text-cream border-ink"
                          : "bg-background text-foreground/70 border-foreground/15 hover:border-foreground/40"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Sort by</p>
              <div className="flex flex-col gap-0.5">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSortAndReset(opt.key)}
                    className={`text-left px-3 py-2 rounded-sm text-sm transition-colors ${
                      sort === opt.key ? "bg-brand-soft text-brand font-semibold" : "text-foreground/70 hover:bg-foreground/5"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div>
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-3xl font-serif italic text-muted-foreground">Nothing matches.</p>
                <button
                  onClick={() => {
                    setQueryAndReset("");
                    setCategoryAndReset("All");
                  }}
                  className="mt-4 text-sm underline underline-offset-4"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-4">
                  <span className="size-1.5 rounded-full bg-mint" /> In stock
                  <span className="size-1.5 rounded-full bg-pop ml-3" /> Limited
                  <span className="size-1.5 rounded-full bg-brand ml-3" /> Pre-order
                  <span className="ml-auto">Page {currentPage} of {totalPages}</span>
                </div>
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {paginated.map((p, idx) => (
                    <ProductTiltCard key={p.id} className="group relative">
                      <article className="relative bg-card rounded-sm border border-foreground/10 overflow-hidden h-full flex flex-col shadow-[0_1px_0_rgba(0,0,0,0.04)] hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.35)] transition-shadow">
                        <button
                          type="button"
                          className={`relative aspect-square overflow-hidden block w-full text-left ${p.swatch}`}
                          aria-label={`Quick view ${p.name}`}
                        >
                          <img
                            src={p.image_url}
                            alt={p.name}
                            loading={idx < 5 ? "eager" : "lazy"}
                            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                          />
                          <span className="absolute top-2 left-2 text-[9px] font-bold tracking-widest uppercase bg-background/90 backdrop-blur px-1.5 py-0.5 rounded-sm">
                            {p.index}
                          </span>
                          <span
                            role="button"
                            aria-label="Save"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaved(p.id);
                            }}
                            className={`absolute bottom-2 right-2 size-7 grid place-items-center rounded-full bg-background/90 backdrop-blur text-xs transition-all hover:scale-110 ${
                              saved.has(p.id) ? "opacity-100 text-pop" : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            {saved.has(p.id) ? "♥" : "♡"}
                          </span>
                        </button>
                        <div className="p-3 flex flex-col gap-1.5 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-serif text-sm sm:text-base leading-tight line-clamp-1">
                              {p.name}
                            </h3>
                            <span className="font-mono text-xs font-semibold tabular-nums shrink-0">
                              {p.price}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="uppercase tracking-widest">{p.categoryLabel}</span>
                            <span className="flex items-center gap-1">
                              <span className="text-pop">★</span>
                              <span className="font-medium text-foreground tabular-nums">
                                {p.rating.toFixed(1)}
                              </span>
                            </span>
                          </div>
                          <Link
                            to={p.link}
                            data-cursor="Bag it"
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="mt-2 inline-flex items-center justify-center gap-1.5 bg-ink text-cream rounded-sm py-1.5 text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-transform"
                          >
                            + Get Now · {p.price}
                          </Link>
                        </div>
                      </article>
                    </ProductTiltCard>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-1.5 rounded-sm border border-foreground/15 px-4 py-2 text-[11px] font-bold uppercase tracking-widest hover:border-foreground/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      const active = p === currentPage;
                      return (
                        <button
                          key={p}
                          onClick={() => goToPage(p)}
                          aria-current={active ? "page" : undefined}
                          className={`size-10 grid place-items-center rounded-sm text-sm font-semibold tabular-nums transition-all ${
                            active
                              ? "bg-ink text-cream scale-110 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.4)]"
                              : "bg-foreground/[0.04] text-foreground/70 hover:bg-foreground/[0.08] hover:text-foreground"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-1.5 rounded-sm border border-foreground/15 px-4 py-2 text-[11px] font-bold uppercase tracking-widest hover:border-foreground/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink px-4 py-14 text-cream sm:px-8 sm:py-20 lg:px-12 border-t-2 border-pop">
        <div className="relative mx-auto grid max-w-[1400px] items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
          <h2 className="font-serif text-4xl leading-[0.95] sm:text-6xl lg:text-7xl">
            Get the next drop
            <br />
            <span className="not-italic font-bold text-pop">before the rest.</span>
          </h2>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3">
  <p className="max-w-md text-sm text-cream/70">
    A monthly note on new arrivals, price drops, and early access for subscribers only.
  </p>

  <div className="flex flex-col gap-2 sm:flex-row">
    <input
      type="email"
      required
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="you@example.com"
      className="flex-1 rounded-sm border border-cream/20 bg-cream/10 px-4 py-3 text-sm text-cream placeholder:text-cream/40 focus:border-cream/60 focus:outline-none"
    />

    <button
      type="submit"
      disabled={loading}
      className="rounded-sm bg-pop px-5 py-3 text-xs font-bold uppercase tracking-widest text-pop-foreground transition-transform hover:scale-[1.03] disabled:opacity-50"
    >
      {loading ? "Submitting..." : "Notify me →"}
    </button>
  </div>

  {error ? (
    <p className="text-sm text-red-400">{error}</p>
  ) : message ? (
    <p className="text-sm text-green-400">{message}</p>
  ) : (
    <p className="text-[10px] uppercase tracking-widest text-cream/40">
      No spam. Unsubscribe in one click.
    </p>
  )}
</form>
        </div>
      </section>
      <Footer />

      {/* Quick view modal */}
      {quickView && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center p-4 sm:p-6 bg-ink/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setQuickView(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-background rounded-sm border border-foreground/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden grid sm:grid-cols-2 animate-scale-in"
          >
            <button
              onClick={() => setQuickView(null)}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 size-8 grid place-items-center rounded-full bg-background/90 backdrop-blur border border-foreground/10 hover:scale-110 transition-transform"
            >
              ✕
            </button>
            <div className={`relative aspect-square sm:aspect-auto ${quickView.swatch}`}>
              <img
                src={quickView.image}
                alt={quickView.name}
                className="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
              />
              <span className="absolute top-3 left-3 text-[10px] font-bold tracking-widest uppercase bg-background/90 backdrop-blur px-2 py-1 rounded-sm">
                {quickView.index} · {quickView.categoryLabel}
              </span>
            </div>
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  {quickView.status} · {quickView.year}
                </div>
                <h3 className="font-serif text-3xl sm:text-4xl leading-tight mt-2">
                  {quickView.name}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-mono text-xl font-semibold tabular-nums">
                    {quickView.price}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <span className="text-pop">★</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {quickView.rating.toFixed(1)}
                    </span>
                    <span>({quickView.reviews} reviews)</span>
                  </span>
                </div>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">{quickView.desc}</p>
              <div className="rounded-sm bg-foreground/[0.04] px-3 py-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                Materials ·{" "}
                <span className="text-foreground normal-case tracking-normal">
                  {quickView.materials}
                </span>
              </div>
              <div className="mt-auto flex gap-2">
                <a
                  href=""
                  className="flex-1 text-center bg-ink text-cream rounded-sm py-3 text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-transform"
                >
                  Shop now
                </a>
                <button
                  onClick={() => toggleSaved(quickView.id)}
                  className={`size-12 grid place-items-center rounded-full border transition-colors ${
                    saved.has(quickView.id)
                      ? "border-pop text-pop bg-pop/10"
                      : "border-foreground/15 hover:border-foreground/40"
                  }`}
                  aria-label="Save"
                >
                  {saved.has(quickView.id) ? "♥" : "♡"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
