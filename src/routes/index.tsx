import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { MobileMenu } from "@/components/MobileMenu";
import { NavSearch } from "@/components/NavSearch";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { absoluteUrl, breadcrumbLd, DEFAULT_OG_IMAGE } from "@/lib/seo";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import blog1 from "@/assets/blog-1.jpg";
import blog2 from "@/assets/blog-2.jpg";
import blog3 from "@/assets/blog-3.jpg";
import blog4 from "@/assets/blog-4.jpg";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";


const TITLE = "TheShoppingHabit — Product Reviews & Buying Guides";
const DESCRIPTION =
  "Trusted product reviews, buying guides, comparisons, and the latest deals on tech, home, fashion, fitness, and more.";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: DEFAULT_OG_IMAGE },
      { property: "og:url", content: absoluteUrl("/") },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      { "script:ld+json": breadcrumbLd([{ name: "Home", path: "/" }]) },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
  }),
});

type ApiMedia = {
  id: number;
  filename: string;
  alt_text: string;
  caption: string;
  image_url: string;
};

type Slide = {
  image: string;
  link: string;
  title: string[];
};

const MEDIA_API = "https://backend.buyersbulletin.com/api/medias";

type Category = "Fashion" | "Tech" | "Beauty" | "Gym" | "Home & Living";

type Product = {
  id: string;
  index: string;
  name: string;
  category: Category;
  desc: string;
  price: string;
  year: string;
  materials: string;
  image: string;
  status: "In Stock" | "Pre-Order" | "Limited";
  badge?: "New" | "Bestseller" | "Studio Pick" | "Hot";
  swatch: string;
  rating: number;
  reviews: number;
  link: string;
};

// Shape returned by the real products API (same one used on /products).
type ApiProduct = {
  id: number | string;
  name: string;
  slug?: string;
  category_id?: number | string;
  category?: string;
  description?: string;
  price: string | number;
  image?: string;
  image_url?: string;
  link?: string;
  created_at?: string;
  status?: Product["status"];
  badge?: Product["badge"];
  materials?: string;
  rating?: number;
  reviews?: number;
};

const productFallbackImages = [
  product1,
  product2,
  product3,
  product4,
  product5,
  product6,
  product7,
  product8,
];
const productSwatches = ["bg-white"];
const productCategoryFallback: Category[] = ["Fashion", "Tech", "Beauty", "Gym", "Home & Living"];

function mapApiProduct(p: ApiProduct, i: number): Product {
  const category = productCategoryFallback.includes(p.category as Category)
    ? (p.category as Category)
    : productCategoryFallback[i % productCategoryFallback.length];
  return {
    id: String(p.id),
    index: String(i + 1).padStart(2, "0"),
    name: p.name,
    category,
    desc: p.description || "",
    price:
      typeof p.price === "number"
        ? `$${p.price}`
        : p.price?.startsWith("$")
          ? p.price
          : `$${p.price}`,
    year: p.created_at
      ? String(new Date(p.created_at).getFullYear())
      : String(new Date().getFullYear()),
    materials: p.materials || "",
    image: p.image_url || p.image || productFallbackImages[i % productFallbackImages.length],
    status: p.status || "In Stock",
    badge: p.badge,
    swatch: productSwatches[i % productSwatches.length],
    rating: p.rating ?? 4.5,
    reviews: p.reviews ?? 0,
    link: p.link || "#",
  };
}

const productCategories = ["All", "Fashion", "Tech", "Beauty", "Gym", "Home & Living"] as const;
type FilterCategory = (typeof productCategories)[number];

const categoryIcons: Record<FilterCategory, string> = {
  All: "✦",
  Fashion: "✿",
  Tech: "◉",
  Beauty: "❀",
  Gym: "◆",
  "Home & Living": "⌂",
};

type Article = {
  id: string;
  postId: string;
  index: string;
  tag: string;
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
  date: string;
  image: string;
};

type InteractiveCard = {
  id: string;
  postId: string;
  tag: string;
  title: string;
  excerpt: string;
  meta: string;
  image: string;
  accent: "brand" | "pop" | "mint" | "ink";
};

// Shape returned by the real blogs API (same shape used on /blog and /blog/$slug).
type ApiBlog = {
  id: number | string;
  title: string;
  slug: string;
  image_url?: string;
  description?: string;
  content?: string;
  created_at?: string;
  tag?: string;
  category?: string;
  author?: string;
  read_time?: string;
};

const BLOGS_API_URL = "https://backend.buyersbulletin.com/api/blogs";
const fallbackImages = [blog1, blog2, blog3, blog4];
const cardAccents: InteractiveCard["accent"][] = ["brand", "pop", "mint", "ink"];

function mapBlogToArticle(blog: ApiBlog, i: number): Article {
  return {
    id: String(blog.id),
    postId: blog.slug,
    index: String(i + 1).padStart(2, "0"),
    tag: blog.tag || blog.category || "Journal",
    title: blog.title,
    excerpt: blog.description || "",
    author: blog.author || "TheShoppingHabit",
    readTime: blog.read_time || "5 min read",
    date: blog.created_at
      ? new Date(blog.created_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "",
    image: blog.image_url || fallbackImages[i % fallbackImages.length],
  };
}

function mapBlogToInteractiveCard(blog: ApiBlog, i: number): InteractiveCard {
  return {
    id: `ic-${blog.id}`,
    postId: blog.slug,
    tag: blog.tag || blog.category || "Journal",
    title: blog.title,
    excerpt: blog.description || "",
    meta: blog.read_time || "5 min read",
    image: blog.image_url || fallbackImages[i % fallbackImages.length],
    accent: cardAccents[i % cardAccents.length],
  };
}

const marqueeTopics = [
  "Spatial Design",
  "Editorial Systems",
  "Type Specimens",
  "Motion Studies",
  "Material Research",
  "Interface Theory",
  "Sound Design",
  "Brand Architecture",
];

function Hero() {
  const [slides, setSlides] = useState<Slide[]>([]);

  const [active, setActive] = useState(0);

  useEffect(() => {
    fetch(MEDIA_API)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          const mapped: Slide[] = result.data.map((item: ApiMedia) => ({
            image: item.image_url,
            link: item.alt_text,
            title: item.caption ? item.caption.split(",") : item.alt_text.split(","),
          }));

          setSlides(mapped);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!slides.length) return;

    const id = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 6000);

    return () => clearInterval(id);
  }, [slides]);

  if (!slides.length) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="relative h-[60vh] min-h-[440px] w-full flex items-center justify-center border-2 border-foreground/10 rounded-sm bg-foreground/5">
          Loading...
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <div className="relative h-[60vh] min-h-[440px] w-full overflow-hidden bg-neutral-200 border-2 border-foreground/10 rounded-sm">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === active ? 1 : 0 }}
            aria-hidden={i !== active}
          >
            <img
              src={slide.image}
              alt={slide.title.filter(Boolean).join(" ") || "TheShoppingHabit featured deal"}
              className="w-full h-full object-cover"
              width={1920}
              height={1088}
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}

        <div className="relative h-full flex flex-col justify-end px-5 sm:px-10 pb-10 sm:pb-14">
          <Link
            to={`${slides[active].link}`} target="_blank" rel="noopener noreferrer sponsored"
            className="group self-start inline-flex items-center gap-3 bg-brand text-brand-foreground pl-5 pr-2 py-2 rounded-sm hover:brightness-110 transition-[filter]"
          >
            <span className="text-sm font-bold uppercase tracking-widest">Get Now</span>
            <span className="size-8 bg-brand-foreground/15 rounded-sm flex items-center justify-center shrink-0">
              <svg className="size-4 text-brand-foreground" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8.5 3.5a.5.5 0 0 1 .854-.354l4.5 4.5a.5.5 0 0 1 0 .708l-4.5 4.5A.5.5 0 0 1 8.5 12.5v-9Z" />
                <path d="M3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8Z" />
              </svg>
            </span>
          </Link>
        </div>

        <div className="absolute bottom-5 sm:bottom-8 right-5 sm:right-10 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 w-8 sm:w-12 rounded-sm transition-colors ${i === active ? "bg-pop" : "bg-background/40 hover:bg-background/70"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-pop-foreground"
      aria-label={`Rated ${rating} out of 5`}
    >
      <svg viewBox="0 0 20 20" className="size-3.5 fill-pop" aria-hidden>
        <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z" />
      </svg>
      <span className="font-mono text-[11px] text-foreground/80 tabular-nums">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

const badgeStyles: Record<NonNullable<Product["badge"]>, string> = {
  New: "bg-mint text-ink",
  Bestseller: "bg-pop text-pop-foreground",
  "Studio Pick": "bg-brand text-brand-foreground",
  Hot: "bg-ink text-cream",
};

const PRODUCTS_API_URL = "https://backend.buyersbulletin.com/api/products";

function ProductShowcase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      try {
        const response = await fetch(PRODUCTS_API_URL);
        const result = await response.json();
        const data: ApiProduct[] = Array.isArray(result)
          ? result
          : result?.data?.data || result?.data || result?.products || [];
        if (!cancelled) setProducts(data.map(mapApiProduct));
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const [category, setCategory] = useState<FilterCategory>("All");
  const [cart, setCart] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const filtered = category === "All" ? products : products.filter((p) => p.category === category);

  const toggle = (list: string[], setList: (v: string[]) => void, id: string) =>
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const featured = products[3] ?? products[0]; // 4th product as hero, fall back to the 1st

  // Trending = top 3 by rating × reviews (simple synthetic ranking)
  const trending = [...products]
    .sort((a, b) => b.rating * b.reviews - a.rating * a.reviews)
    .slice(0, 3);

  if (loading) {
    return (
      <section
        id="work"
        className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-t-2 border-foreground/10"
      >
        <div className="max-w-screen-xl mx-auto text-center text-sm text-muted-foreground">
          Loading products…
        </div>
      </section>
    );
  }

  if (!featured) {
    return (
      <section
        id="work"
        className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-t-2 border-foreground/10"
      >
        <div className="max-w-screen-xl mx-auto text-center text-sm text-muted-foreground">
          No products found.
        </div>
      </section>
    );
  }

  return (
    <section
      id="work"
      className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-t-2 border-foreground/10"
    >
      <div className="relative max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8 sm:mb-10">
          <div>
            <h2 className="text-[2rem] sm:text-4xl md:text-6xl font-semibold tracking-tight text-balance leading-[1] md:leading-[0.95]">
              Objects people are{" "}
              <span className="not-italic font-bold underline decoration-pop decoration-[3px] underline-offset-4">
                obsessing over.
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-mint animate-pulse" />
              Stock updates live
            </div>
          </div>
        </div>

        {/* Hero featured product */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-10 sm:mb-12">
          <article className="lg:col-span-7 relative overflow-hidden rounded-sm bg-brand text-brand-foreground p-6 sm:p-8 md:p-12 group">
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
              <div className="order-2 md:order-1">
                <span className="inline-flex items-center gap-2 bg-pop text-pop-foreground rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-4 sm:mb-5">
                  ★ Editor's pick
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight leading-[1] mb-3 sm:mb-4">
                  {featured.name}
                </h3>
                <p className="text-sm sm:text-base text-brand-foreground/80 text-pretty mb-5 sm:mb-6 max-w-sm">
                  {featured.desc}
                </p>
                <div className="flex items-baseline gap-3 mb-5 sm:mb-6">
                  <span className="text-2xl sm:text-3xl font-semibold">{featured.price}</span>
                  <StarRow rating={featured.rating} />
                </div>
                <div className="flex gap-3">
                  <Link
                    to={featured.link}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    data-cursor="Get Now"
                    className="inline-flex items-center gap-2 bg-cream text-ink rounded-sm px-4 sm:px-5 py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold uppercase tracking-widest hover:scale-[1.03] transition-transform"
                  >
                    Get Now
                  </Link>
                  <button
                    onClick={() => toggle(wishlist, setWishlist, featured.id)}
                    aria-label="Save to wishlist"
                    className="inline-flex items-center justify-center size-10 sm:size-11 rounded-sm bg-brand-foreground/10 hover:bg-brand-foreground/20 transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={wishlist.includes(featured.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      className="size-4"
                    >
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="order-1 md:order-2 relative aspect-square rounded-sm overflow-hidden bg-brand-foreground/10">
                <img
                  src={featured.image}
                  alt={featured.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
          </article>

          {/* Side column — Trending leaderboard (products only) */}
          <aside className="lg:col-span-5 relative overflow-hidden rounded-sm bg-ink text-cream p-6 sm:p-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em]">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-mint opacity-70 animate-ping" />
                  <span className="relative inline-flex size-2 rounded-full bg-mint" />
                </span>
                Trending now · top 3
              </span>
              <span className="text-[10px] font-mono text-cream/40">updated 2m ago</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight leading-tight">
              What people are <span className="not-italic font-bold text-pop">picking up</span> this
              week.
            </h3>

            <ul className="flex flex-col gap-2.5 mt-1">
              {trending.map((p, i) => {
                return (
                  <li
                    key={p.id}
                    className="group relative flex items-center gap-3 rounded-sm bg-cream/5 hover:bg-cream/10 p-2.5 sm:p-3 transition-colors animate-fade-up"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-widest text-pop tabular-nums w-5 shrink-0">
                      0{i + 1}
                    </span>
                    <div
                      className={`relative size-12 sm:size-14 shrink-0 rounded-sm overflow-hidden ${p.swatch}`}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-cream/50 truncate">
                        {p.category}
                      </p>
                      <p className="text-sm font-semibold tracking-tight truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRow rating={p.rating} />
                        <span className="text-[10px] font-mono text-cream/40 tabular-nums">
                          {p.reviews} reviews
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-sm font-semibold tabular-nums">{p.price}</span>
                      <Link
                        to={p.link}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="text-[9px] font-bold uppercase tracking-widest rounded-sm px-2.5 py-1 transition-colors bg-cream text-ink hover:bg-pop hover:text-pop-foreground"
                      >
                        + Buy
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-auto pt-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-cream/50">
              <span>Live ranking</span>
              <Link to="/products" className="text-pop hover:underline">
                See all →
              </Link>
            </div>
          </aside>
        </div>

        {/* Section divider for the catalogue */}
        <div className="flex items-end justify-between mb-5 sm:mb-6">
          <div>
            <h3 className="mt-2 text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
              Drop into your bag.
            </h3>
          </div>
          <span className="hidden sm:inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <span className="size-1.5 rounded-full bg-pop animate-pulse" /> Hover to feel it
          </span>
        </div>

        {/* Compact product grid — 4 cols on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
          {filtered.slice(0, 8).map((p) => {
            const liked = wishlist.includes(p.id);
            return (
              <ProductTiltCard
                key={p.id}
                className="group relative rounded-sm overflow-hidden bg-background outline-1 -outline-offset-1 outline-foreground/5 hover:outline-foreground/25 hover:shadow-[0_25px_50px_-25px_rgba(0,0,0,0.35)]"
              >
                <div
                  className={`relative aspect-[4/5] overflow-hidden ${p.swatch}`}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    width={500}
                    height={625}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
                  />

                  <span className="absolute top-3 left-3 font-mono text-[9px] tracking-widest text-foreground/50 bg-background/70 backdrop-blur px-1.5 py-0.5 rounded-sm">
                    /{p.index}
                  </span>

                  {p.badge && (
                    <span
                      className={`absolute top-3 right-3 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${badgeStyles[p.badge]}`}
                    >
                      {p.badge}
                    </span>
                  )}

                  <button
                    onClick={() => toggle(wishlist, setWishlist, p.id)}
                    aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                    data-cursor={liked ? "Saved" : "Save"}
                    className={`absolute top-10 right-3 size-8 rounded-sm grid place-items-center backdrop-blur transition-all duration-300 z-10 ${
                      liked
                        ? "bg-brand text-brand-foreground scale-100 opacity-100"
                        : "bg-background/85 text-foreground opacity-100 sm:opacity-0 sm:-translate-y-1 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 hover:bg-background"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={liked ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      className="size-3.5"
                    >
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z" />
                    </svg>
                  </button>

                  <div className="absolute inset-x-3 bottom-3 sm:translate-y-[140%] sm:group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <Link
                      to={p.link}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      data-cursor="Shop now"
                      className="block w-full text-center rounded-sm py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors bg-ink text-cream hover:bg-brand"
                    >
                      Shop now
                    </Link>
                  </div>
                </div>

                <div className="p-3 sm:p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground truncate">
                      {p.category}
                    </span>
                    <StarRow rating={p.rating} />
                  </div>
                  <h4 className="text-sm font-semibold tracking-tight truncate">{p.name}</h4>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold">{p.price}</span>
                    <span className="ml-auto text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                      {p.status}
                    </span>
                  </div>
                </div>
              </ProductTiltCard>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground py-8">No objects in this category yet.</p>
        )}

        <div className="mt-10 sm:mt-12 flex justify-center">
          <Link
            to="/products"
            data-cursor="Shop all"
            className="inline-flex items-center gap-3 bg-ink text-cream rounded-sm pl-2 pr-4 sm:pr-5 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-widest hover:scale-[1.03] transition-transform"
          >
            <span className="size-7 rounded-sm bg-pop text-pop-foreground grid place-items-center">
              →
            </span>
            Shop the full catalogue
          </Link>
        </div>
      </div>
    </section>
  );
}

function BlogSection() {
  return <BlogSectionInner />;
}

function ProductTiltCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <article
      className={`${className ?? ""} transition-transform duration-200 ease-out hover:-translate-y-1`}
    >
      {children}
    </article>
  );
}

const accentClasses: Record<
  InteractiveCard["accent"],
  { bg: string; chip: string; ring: string; halo: string }
> = {
  brand: {
    bg: "bg-brand text-brand-foreground",
    chip: "bg-brand-foreground/15 text-brand-foreground",
    ring: "ring-brand/40",
    halo: "bg-pop/40",
  },
  pop: {
    bg: "bg-pop text-pop-foreground",
    chip: "bg-pop-foreground/15 text-pop-foreground",
    ring: "ring-pop/40",
    halo: "bg-brand/40",
  },
  mint: {
    bg: "bg-mint text-ink",
    chip: "bg-ink/10 text-ink",
    ring: "ring-mint/60",
    halo: "bg-brand/30",
  },
  ink: {
    bg: "bg-ink text-cream",
    chip: "bg-cream/10 text-cream",
    ring: "ring-ink/40",
    halo: "bg-pop/30",
  },
};

function InteractiveBlogCards({
  cards,
  saved,
  onToggleSave,
}: {
  cards: InteractiveCard[];
  saved: string[];
  onToggleSave: (id: string) => void;
  hoverId: string | null;
  onHover: (id: string | null) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: 1 | -1) => {
    const s = scrollerRef.current;
    if (!s) return;
    s.scrollBy({ left: dir * (s.clientWidth * 0.7), behavior: "smooth" });
  };

  return (
    <div className="mb-12 sm:mb-14">
      <div className="flex items-end justify-between mb-5 sm:mb-6 gap-4">
        <div>
          <h3 className="mt-2 text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
            Discover what's New Today
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollBy(-1)}
            className="size-9 sm:size-10 grid place-items-center rounded-sm border-2 border-foreground/15 hover:border-brand text-foreground transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-4"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollBy(1)}
            className="size-9 sm:size-10 grid place-items-center rounded-sm bg-brand text-brand-foreground hover:brightness-110 transition-[filter]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-4"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Flat horizontal photo scroller — no 3D tilt */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 z-10 bg-gradient-to-r from-background to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 z-10 bg-gradient-to-l from-background to-transparent"
        />

        <div
          ref={scrollerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 sm:px-6 lg:px-8 py-2 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {cards.map((c) => {
            const isSaved = saved.includes(c.id);
            return (
              <div key={c.id} className="snap-center shrink-0 w-[78%] xs:w-[68%] sm:w-[56%] md:w-[44%] lg:w-[34%] xl:w-[28%]">
                <Link
                  to="/blog/$slug"
                  params={{ slug: c.postId }}
                  data-cursor="Read"
                  className="group relative block overflow-hidden rounded-sm border-2 border-foreground/10 aspect-[3/4]"
                >
                  <img
                    src={c.image}
                    alt={c.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />

                  <div className="relative h-full flex flex-col justify-between p-5 sm:p-6 text-cream">
                    <div className="flex items-start justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onToggleSave(c.id);
                        }}
                        aria-label={isSaved ? "Unsave" : "Save"}
                        className={`size-8 grid place-items-center rounded-sm transition-all ${
                          isSaved
                            ? "bg-pop text-pop-foreground"
                            : "bg-ink/40 text-cream hover:bg-ink/60"
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill={isSaved ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          className="size-3.5"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </div>

                    <div>
                      <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight leading-[1.05] text-balance mb-3">
                        {c.title}
                      </h4>
                      <p className="text-sm text-pretty leading-snug text-cream/80 mb-4 line-clamp-3">
                        {c.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-pop group-hover:translate-x-1 transition-transform duration-300">
                        Read →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}

          {/* Trailing spacer so last card can center */}
          <div aria-hidden className="shrink-0 w-2" />
        </div>
      </div>
    </div>
  );
}

function BlogSectionInner() {
  const [blogs, setBlogs] = useState<ApiBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchBlogs = async () => {
      try {
        const response = await fetch(BLOGS_API_URL);
        const result = await response.json();
        // Accept a few common response shapes: a plain array, { data: [...] },
        // { data: { data: [...] } }, or { blogs: [...] }.
        const data: ApiBlog[] = Array.isArray(result)
          ? result
          : result?.data?.data || result?.data || result?.blogs || [];
        if (!cancelled) setBlogs(data);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBlogs();
    return () => {
      cancelled = true;
    };
  }, []);

  const allArticles = blogs.map(mapBlogToArticle);
  const featuredArticle = allArticles[0];
  const interactiveCardsSource = blogs.slice(1, 5);
  const interactiveCards = interactiveCardsSource.map(mapBlogToInteractiveCard);
  // Show a different set of blogs in each section: exclude whatever is
  // already shown as the featured highlight or in the interactive cards
  // carousel from the list below, so nothing repeats.
  const usedBlogIds = new Set<string>([
    ...(featuredArticle ? [featuredArticle.id] : []),
    ...interactiveCardsSource.map((b) => String(b.id)),
  ]);
  const articles = allArticles.filter((a) => !usedBlogIds.has(a.id));

  const allTags = ["All", ...Array.from(new Set(allArticles.map((a) => a.tag)))];
  const [tag, setTag] = useState<string>("All");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const list = tag === "All" ? articles : articles.filter((a) => a.tag === tag);
  const showFeatured = !!featuredArticle && (tag === "All" || featuredArticle.tag === tag);
  const previewPool = allArticles;
  const previewed = previewPool.find((a) => a.id === hoverId);

  const toggleSave = (id: string) =>
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  if (loading) {
    return (
      <section
        id="intel"
        className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-background"
      >
        <div className="max-w-screen-xl mx-auto text-center text-sm text-muted-foreground">
          Loading blogs…
        </div>
      </section>
    );
  }

  if (!loading && allArticles.length === 0) {
    return (
      <section
        id="intel"
        className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-background"
      >
        <div className="max-w-screen-xl mx-auto text-center text-sm text-muted-foreground">
          No blogs found.
        </div>
      </section>
    );
  }

  return (
    <section
      id="intel"
      className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden"
      onMouseMove={(e) => setCoords({ x: e.clientX, y: e.clientY })}
    >
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 sm:gap-6 mb-8 sm:mb-10">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-3 sm:mb-4 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-brand animate-pulse" />
              Blogs · {list.length + (showFeatured ? 1 : 0)}
            </p>
            <h2 className="text-[2rem] sm:text-4xl md:text-6xl font-semibold tracking-tight text-balance leading-[1] md:leading-[0.95]">
              Curated Reads &{" "}
              <span className="not-italic font-bold underline decoration-pop decoration-[3px] underline-offset-4">
                Trends
              </span>
            </h2>
          </div>
        </div>

        {/* Featured article card */}
        {showFeatured && (
          <Link
            to="/blog/$slug"
            params={{ slug: featuredArticle.postId }}
            data-cursor="Read featured"
            onMouseEnter={() => setHoverId(featuredArticle.id)}
            onMouseLeave={() => setHoverId(null)}
            className="group relative grid grid-cols-1 lg:grid-cols-12 gap-0 mb-12 sm:mb-14 overflow-hidden rounded-sm bg-ink text-cream"
          >
            <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden">
              <img
                src={featuredArticle.image}
                alt={featuredArticle.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                loading="lazy"
              />
              <span className="absolute top-5 left-5 inline-flex items-center gap-2 bg-pop text-pop-foreground rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                ★ Featured
              </span>
            </div>
            <div className="lg:col-span-5 p-6 sm:p-8 md:p-12 flex flex-col justify-between gap-6 sm:gap-8">
              <div>
                <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-cream/60 mb-4 sm:mb-5">
                  <span className="text-pop">{featuredArticle.tag}</span>
                  <span>·</span>
                  <span>{featuredArticle.readTime}</span>
                  <span>·</span>
                  <span>{featuredArticle.date}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight leading-[1.05] mb-4 sm:mb-5 text-balance">
                  {featuredArticle.title}
                </h3>
                <p className="text-sm sm:text-base text-cream/70 text-pretty max-w-md">
                  {featuredArticle.excerpt}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-cream/60">
                  By <span className="text-cream">{featuredArticle.author}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSave(featuredArticle.id);
                    }}
                    aria-label={saved.includes(featuredArticle.id) ? "Unsave" : "Save"}
                    className={`size-9 sm:size-10 rounded-sm grid place-items-center transition-all ${
                      saved.includes(featuredArticle.id)
                        ? "bg-brand text-brand-foreground scale-110"
                        : "bg-cream/10 text-cream hover:bg-cream/20"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={saved.includes(featuredArticle.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      className="size-4"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                  <span className="inline-flex items-center gap-2 bg-cream text-ink rounded-sm px-3.5 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-widest group-hover:bg-pop group-hover:text-pop-foreground transition-colors">
                    Read now →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Interactive cards — sit between the featured story and the index list */}
        <InteractiveBlogCards
          cards={interactiveCards}
          saved={saved}
          onToggleSave={toggleSave}
          hoverId={hoverId}
          onHover={setHoverId}
        />

        {/* Interactive list */}
        <ul className="border-t border-foreground/10" onMouseLeave={() => setHoverId(null)}>
          {list.slice(0, 3).map((a) => {
            const active = hoverId === a.id;
            const dim = hoverId !== null && !active;
            const isSaved = saved.includes(a.id);
            return (
              <li
                key={a.id}
                onMouseEnter={() => setHoverId(a.id)}
                className="border-b border-foreground/10"
              >
                <div
                  className="group relative py-7 md:py-8 transition-opacity duration-300"
                  style={{ opacity: dim ? 0.35 : 1 }}
                >
                  <Link
                    to="/blog/$slug"
                    params={{ slug: a.postId }}
                    data-cursor="Read"
                    className="block"
                  >
                    <div className="grid grid-cols-12 gap-4 items-baseline">
                      <span className="col-span-2 md:col-span-1 font-mono text-[10px] text-muted-foreground tabular-nums">
                        {a.index}
                      </span>
                      <h3
                        className="col-span-10 md:col-span-6 text-lg sm:text-2xl md:text-3xl font-medium tracking-tight transition-transform duration-500 ease-out"
                        style={{ transform: active ? "translateX(8px)" : "translateX(0)" }}
                      >
                        <span className="bg-gradient-to-r from-brand to-brand bg-no-repeat bg-[length:0%_2px] bg-[position:0_100%] group-hover:bg-[length:100%_2px] transition-[background-size] duration-500">
                          {a.title}
                        </span>
                      </h3>
                      <span className="hidden md:block md:col-span-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                        {a.tag}
                      </span>
                      <span className="hidden md:block md:col-span-2 md:text-right font-mono text-[11px] text-muted-foreground tabular-nums">
                        {a.readTime}
                      </span>
                    </div>
                    <div className="md:hidden mt-1 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      <span>{a.tag}</span>
                      <span>·</span>
                      <span className="tabular-nums">{a.readTime}</span>
                    </div>
                  </Link>
                  {/* Hover progress bar */}
                  <span
                    aria-hidden
                    className="absolute left-0 bottom-[-1px] h-px bg-brand transition-all duration-700 ease-out"
                    style={{ width: active ? "100%" : "0%" }}
                  />
                  {/* Save button (desktop) */}
                  <button
                    type="button"
                    onClick={() => toggleSave(a.id)}
                    aria-label={isSaved ? "Unsave article" : "Save article"}
                    data-cursor={isSaved ? "Saved" : "Save"}
                    className={`hidden md:grid absolute right-0 top-1/2 -translate-y-1/2 size-9 place-items-center rounded-sm transition-all ${
                      isSaved
                        ? "bg-brand text-brand-foreground opacity-100 scale-100"
                        : "bg-foreground/5 text-foreground opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={isSaved ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      className="size-4"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {list.length === 0 && !showFeatured && (
          <p className="text-sm text-muted-foreground py-12 text-center">
            No entries under "{tag}" yet.
          </p>
        )}

        {/* Explore more CTA */}
        <div className="mt-12 sm:mt-14 flex justify-center">
          <Link
            to="/blog"
            data-cursor="Explore"
            className="group inline-flex items-center gap-3 bg-ink text-cream rounded-sm pl-2 pr-5 sm:pr-6 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-widest hover:scale-[1.04] transition-transform"
          >
            <span className="size-9 sm:size-10 grid place-items-center rounded-sm bg-pop text-pop-foreground transition-transform group-hover:rotate-45">
              <svg viewBox="0 0 16 16" fill="currentColor" className="size-4">
                <path d="M8.5 3.5a.5.5 0 0 1 .854-.354l4.5 4.5a.5.5 0 0 1 0 .708l-4.5 4.5A.5.5 0 0 1 8.5 12.5v-9Z" />
                <path d="M3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8Z" />
              </svg>
            </span>
            Explore more blogs
          </Link>
        </div>

        {/* Saved counter */}
        {saved.length > 0 && (
          <div className="mt-10 inline-flex items-center gap-3 bg-ink text-cream rounded-sm pl-2 pr-5 py-2 text-xs font-bold uppercase tracking-widest animate-fade-up">
            <span className="size-7 rounded-sm bg-brand text-brand-foreground grid place-items-center font-mono">
              {saved.length}
            </span>
            saved to your reading list
          </div>
        )}

        {/* Floating cursor-tracked preview (desktop) */}
        <div
          aria-hidden
          className="hidden lg:block pointer-events-none fixed top-0 left-0 z-40 w-[280px] aspect-[4/5] rounded-sm overflow-hidden shadow-2xl outline-1 outline-black/10 transition-[opacity,transform] duration-300 ease-out"
          style={{
            opacity: previewed ? 1 : 0,
            transform: `translate(${coords.x + 24}px, ${coords.y - 180}px) scale(${previewed ? 1 : 0.9})`,
          }}
        >
          {previewed && (
            <img
              src={previewed.image}
              alt=""
              width={560}
              height={700}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
}

function Index() {
  return (
    <main className="bg-background text-foreground selection:bg-foreground/10">
      {/* Top announcement marquee — site-wide creative touch */}
      <div className="relative z-50 bg-ink text-cream py-2 overflow-hidden border-b border-cream/10">
        <div className="flex gap-8 sm:gap-10 whitespace-nowrap animate-[ticker_30s_linear_infinite] text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em]">
          {Array.from({ length: 3 }).map((_, k) => (
            <span key={k} className="flex gap-8 sm:gap-10 items-center shrink-0">
              <span>TRENDING PRODUCTS</span>
              <span className="text-pop">•</span>
              <span>BUYING GUIDES</span>
              <span className="text-pop">•</span>
              <span>PRODUCT COMPARISONS</span>
              <span className="text-pop">•</span>
              <span>VERIFIED REVIEWS</span>
              <span className="text-pop">•</span>
              <span>EXCLUSIVE DEALS</span>
              <span className="text-pop">•</span>
              <span>TRUSTED RECOMMENDATIONS</span>
              <span className="text-pop">•</span>
            </span>
          ))}
        </div>
      </div>

      <h1 className="sr-only">TheShoppingHabit — Product Reviews & Buying Guides</h1>

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
          {/*<Link
            to="/landing-page"
            className="hidden sm:inline-flex items-center gap-2 rounded-sm border border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 px-3.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Landing Page
          </Link>*/}
          <NavSearch />
        </div>
        <MobileMenu />
      </nav>

      <Hero />

      <BlogSection />

      <ProductShowcase />

      <Footer showNewsletter />
    </main>
  );
}
