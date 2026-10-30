import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { MobileMenu } from "@/components/MobileMenu";
import { NavSearch } from "@/components/NavSearch";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import {
  absoluteUrl,
  breadcrumbLd,
  DEFAULT_OG_IMAGE,
  sanitizeArticleHtml,
  SITE_NAME,
  truncate,
} from "@/lib/seo";

const BLOGS_API_URL = "https://backend.buyersbulletin.com/api/blogs";

export const Route = createFileRoute("/blog_/$slug")({
  component: PostPage,
  loader: async ({ params }) => {
    const [postRes, listRes] = await Promise.all([
      fetch(`${BLOGS_API_URL}/${params.slug}`).catch(() => null),
      fetch(`${BLOGS_API_URL}?per_page=8`).catch(() => null),
    ]);
    const result = await postRes?.json().catch(() => null);
    if (!result?.data) {
      throw notFound();
    }

    // Best-effort: a handful of other posts to link from "More from the
    // journal" below the article. If this fetch fails, the post itself
    // still renders fine — related posts just won't show.
    const listJson = await listRes?.json().catch(() => null);
    const listPayload = listJson?.data;
    const allPosts: Blog[] = Array.isArray(listPayload?.data)
      ? listPayload.data
      : Array.isArray(listPayload)
        ? listPayload
        : [];
    const related = allPosts.filter((b) => b.slug !== params.slug).slice(0, 3);

    return { post: result.data as Blog, related };
  },
  head: ({ loaderData, params }) => {
    const post = loaderData?.post;
    const canonical = absoluteUrl(`/blog/${params.slug}`);
    const image = post?.image_url || DEFAULT_OG_IMAGE;

    if (!post) {
      return {
        meta: [{ title: `Blog | ${SITE_NAME}` }],
        links: [{ rel: "canonical", href: canonical }],
      };
    }

    const title = truncate(`${post.title} | ${SITE_NAME}`, 60);
    const description = truncate(
      post.description || `Read "${post.title}" on ${SITE_NAME}.`,
      160,
    );

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { property: "og:url", content: canonical },
        { property: "og:type", content: "article" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
        {
          "script:ld+json": {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            image: [image],
            datePublished: post.created_at,
            dateModified: post.created_at,
            author: { "@type": "Organization", name: SITE_NAME },
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
              logo: { "@type": "ImageObject", url: DEFAULT_OG_IMAGE },
            },
            mainEntityOfPage: canonical,
          },
        },
        {
          "script:ld+json": breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${params.slug}` },
          ]),
        },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center bg-background px-6 text-center">
      <meta name="robots" content="noindex, nofollow" />
      <div>
        <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-brand mb-3">404 · Story</p>
        <h1 className="text-3xl font-semibold tracking-tight mb-4">This story has been pulled from the press.</h1>
        <Link to="/blog" className="inline-flex items-center gap-2 bg-ink text-cream rounded-sm px-4 py-2 text-[11px] font-bold uppercase tracking-widest">
          ← Back to journal
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen grid place-items-center bg-background px-6 text-center">
      <meta name="robots" content="noindex, nofollow" />
      <div>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <button onClick={reset} className="bg-ink text-cream rounded-sm px-4 py-2 text-xs font-bold uppercase tracking-widest">Retry</button>
      </div>
    </div>
  ),
  pendingComponent: () => (
    <div className="min-h-screen flex items-center justify-center">Loading...</div>
  ),
});
interface Blog {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  last_content: string;
  image_url: string;
  created_at: string;
  products: any[];
}
interface Product {
  name?: string;
  image?: string;
  image_url?: string;
  description?: string;
  price?: string | number;
  link?: string;
}
function PostPage() {
  const { post, related } = Route.useLoaderData();
  const [progress, setProgress] = useState(0);

  const articleRef = useRef<HTMLDivElement>(null);

  return (
    <main className="min-h-screen bg-background">
      {/* Reading progress */}
      <div className="fixed top-0 inset-x-0 z-50 h-1 bg-foreground/5">
        <div
          className="h-full bg-gradient-to-r from-brand via-pop to-mint transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Nav */}
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

      <div ref={articleRef}>
        {/* HERO — interactive cover image */}
        <HeroCover post={post} />

        {/* Title + short description */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter leading-[0.98] text-balance mb-4">
              {post.title}
            </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              {post.description}
            </p>

            {/* meta strip */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              <span className="inline-flex items-center gap-2">
              <span className="size-6 rounded-full bg-gradient-to-br from-brand to-pop grid place-items-center text-cream text-[9px]">
                  BB
                </span>
              <span className="normal-case tracking-normal font-sans text-foreground text-xs">TheShoppingHabit</span>
              </span>
              <span>· {new Date(post.created_at).toLocaleDateString()}</span>
            </div>

            {/* intro paragraph */}
          <div
  className="
    mt-8
    text-left
    [&_h1]:text-4xl
    [&_h1]:font-bold
    [&_h1]:mb-6
    [&_h2]:text-3xl
    [&_h2]:font-semibold
    [&_h2]:mt-8
    [&_h2]:mb-4
    [&_h3]:text-2xl
    [&_h3]:font-semibold
    [&_h3]:mt-6
    [&_h3]:mb-3
    [&_p]:mb-4
    [&_ul]:list-disc
    [&_ul]:pl-6
    [&_ol]:list-decimal
    [&_ol]:pl-6
    [&_img]:rounded-sm
    [&_img]:my-6
    [&_a]:text-blue-600
    [&_a]:underline
  "
  dangerouslySetInnerHTML={{
    __html: sanitizeArticleHtml(post.content, post.title),
  }}
/>
          </div>
        </section>

        {/* Products in story */}
        {post.products?.length > 0 && (
      <div className="px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14 space-y-14 sm:space-y-20">
          {post.products.map((product, idx) => (
            <ProductBlock key={idx} product={product} index={idx} total={post.products.length} />
          ))}
        </div>
        )}
            <section className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8">
        <div className="max-w-5xl mx-auto text-center">
          
            {/* intro paragraph */}
          <div
  className="
    mt-8
    text-left
    [&_h1]:text-4xl
    [&_h1]:font-bold
    [&_h1]:mb-6
    [&_h2]:text-3xl
    [&_h2]:font-semibold
    [&_h2]:mt-8
    [&_h2]:mb-4
    [&_h3]:text-2xl
    [&_h3]:font-semibold
    [&_h3]:mt-6
    [&_h3]:mb-3
    [&_p]:mb-4
    [&_ul]:list-disc
    [&_ul]:pl-6
    [&_ol]:list-decimal
    [&_ol]:pl-6
    [&_img]:rounded-sm
    [&_img]:my-6
    [&_a]:text-blue-600
    [&_a]:underline
  "
  dangerouslySetInnerHTML={{
    __html: sanitizeArticleHtml(post.last_content, post.title),
  }}
/>
          </div>
        </section>

        {/* Closing + author card */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12 bg-foreground/[0.02] border-y border-foreground/5">
          <div className="max-w-3xl mx-auto">
          <div className="rounded-sm border border-foreground/10 p-5 sm:p-6 flex items-center gap-4 bg-background">
            <div className="size-12 rounded-full bg-gradient-to-br from-brand to-pop grid place-items-center text-cream text-sm font-mono shrink-0">
                BB
              </div>
              <div className="flex-1 min-w-0">
              <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-muted-foreground">Written by</p>
              <p className="font-semibold text-sm sm:text-base tracking-tight">TheShoppingHabit</p>
              <p className="text-xs text-muted-foreground">Admin · TheShoppingHabit</p>
              </div>
            <button className="hidden sm:inline-flex items-center gap-2 bg-foreground/[0.04] hover:bg-foreground/10 rounded-sm px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors">
                Follow
              </button>
            </div>
          </div>
        </section>



        {/* Related */}
        {related.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <div className="max-w-screen-xl mx-auto">
              <div className="flex items-end justify-between mb-8 gap-4">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">More from <span className="not-italic font-bold">the journal</span></h2>
                <Link to="/blog" className="hidden sm:inline-flex items-center gap-2 bg-foreground/[0.04] hover:bg-foreground/10 rounded-sm px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors">
                  All stories →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="group block rounded-sm overflow-hidden border border-foreground/10 hover:border-foreground/30 transition-all hover:-translate-y-1"
                  >
                    <div className="relative aspect-[5/4] overflow-hidden">
                      <img src={p.image_url} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <span className={`absolute bottom-3 left-3 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest `}>Story</span>
                    </div>


                    <div className="p-5">
                      <h3 className="text-base font-semibold leading-snug mb-2 group-hover:text-brand transition-colors line-clamp-2">{p.title}</h3>
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">TheShoppingHabit</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      
      </div>

      <Footer />
    </main>
  );
}

/* ---------- HERO COVER (parallax tilt + scroll parallax) ---------- */
function HeroCover({ post }: { post: Blog }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setScrollY(Math.max(0, -r.top));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={ref}
      className="relative h-[50vh] sm:h-[60vh] lg:h-[68vh] overflow-hidden bg-ink border-b-2 border-brand"
    >
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out will-change-transform"
        style={{ transform: `translateY(${scrollY * 0.2}px) scale(1.05)` }}
      >
        <img src={post.image_url} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/10 to-ink/70" />
      </div>

      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10">
        <span className="inline-flex items-center gap-2 bg-cream text-ink rounded-sm px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest">
          ★ Featured story
        </span>
      </div>
    </section>
  );
}
function ProductBlock({
  product,
  index,
  total,
}: {
  product: Product;
  index: number;
  total: number;
}) {
  const [liked, setLiked] = useState(false);


  return (
    <section className="max-w-3xl mx-auto">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="font-mono text-[11px] tabular-nums text-brand">
          {String(index + 1).padStart(2, "0")} /
          {String(total).padStart(2, "0")}
        </span>

        <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
          Related Product
        </span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
        {product.name || "Product"}
      </h2>

      {(product.image || product.image_url) && (
        <div className="relative aspect-[16/10] rounded-sm overflow-hidden mb-5">
          <img
            src={product.image_url || product.image || ""}
            alt={product.name || "Product"}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="rounded-sm border border-foreground/10 p-5 bg-background">
        <p className="text-sm text-foreground/85 leading-relaxed">
          {product.description || "No description available."}
        </p>

        {product.price && (
          <div className="mt-4">
            <span className="text-2xl font-semibold">
              {product.price}
            </span>
          </div>
        )}

        <div className="mt-5 flex gap-3">
          {product.link && (
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center justify-center rounded-sm px-5 py-3 bg-ink text-cream text-[11px] font-bold uppercase tracking-widest"
            >
              View Product →
            </a>
          )}

          <button
            type="button"
            onClick={() => setLiked(!liked)}
            className={`size-11 rounded-full ${
              liked
                ? "bg-pop text-pop-foreground"
                : "bg-foreground/[0.05]"
            }`}
          >
            {liked ? "♥" : "♡"}
          </button>
        </div>
      </div>

      {index < total - 1 && (
        <div className="mt-10 flex items-center gap-4 text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
          <span className="h-px flex-1 bg-foreground/10" />
          <span>↓ Next Product</span>
          <span className="h-px flex-1 bg-foreground/10" />
        </div>
      )}
    </section>


  );
}