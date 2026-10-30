import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileMenu } from "@/components/MobileMenu";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { absoluteUrl, breadcrumbLd, DEFAULT_OG_IMAGE } from "@/lib/seo";

const TITLE = "Browse Stores — Coupons & Deals | TheShoppingHabit";
const DESCRIPTION =
  "Browse hundreds of stores for hand-verified coupon codes, deals, and buying guides, all in one place.";

export const Route = createFileRoute("/stores")({
  component: StoresPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: DEFAULT_OG_IMAGE },
      { property: "og:url", content: absoluteUrl("/stores") },
      {
        "script:ld+json": breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Stores", path: "/stores" },
        ]),
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/stores") }],
  }),
});

const API = "https://backend.buyersbulletin.com/api/stores";

function StoresPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const res = await axios.get(API);
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading Stores...
      </div>
    );
  }

  const grouped =
    data?.reduce((acc: any, store: any) => {
      const letter = store.name.charAt(0).toUpperCase();

      if (!acc[letter]) {
        acc[letter] = [];
      }

      acc[letter].push(store);

      return acc;
    }, {}) || {};

  const letters = Object.keys(grouped).sort();

  return (
    <main className="bg-background min-h-screen">

      <nav className="sticky top-0 z-40 bg-background border-b-2 border-brand py-4 px-6 flex justify-between items-center">

        <Link to="/" className="flex items-center shrink-0"><Logo /></Link>

        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">

          <Link to="/">Home</Link>

          <Link to="/blog">Blogs</Link>

          <Link to="/products">Products</Link>

        </div>

        <MobileMenu />

      </nav>

      <section className="max-w-7xl mx-auto px-5 py-12">

        <h1 className="text-5xl font-bold mb-3">
          Browse Stores
        </h1>

        <p className="text-muted-foreground max-w-2xl mb-4">
          Discover coupons, deals and buying guides from hundreds of stores. Every code below is
          hand-tested by our team before it's published, and refreshed regularly so you're never
          copying an expired offer.
        </p>

        <p className="text-muted-foreground max-w-2xl mb-10">
          Use the alphabet index to jump straight to a retailer, or open any store to see its
          current promo codes, sitewide deals, and free-shipping offers.
        </p>

        {/* Alphabet */}

        <div className="flex flex-wrap gap-2 mb-10">

         {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
            <a
              key={letter}
              href={`#${letter}`}
              className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm transition
              ${
                grouped[letter]
                  ? "hover:bg-black hover:text-white"
                  : "opacity-30 cursor-default"
              }`}
            >
              {letter}
            </a>
          ))}

        </div>

        {letters.map((letter) => (

          <section
            key={letter}
            id={letter}
            className="mb-14"
          >

            <div className="border rounded-sm overflow-hidden">

              <div className="bg-gray-50 border-b px-6 py-4">

                <h2 className="text-3xl font-bold text-purple-700">
                  {letter}
                </h2>

              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-4 px-6 py-6">

                {grouped[letter].map((store: any) => (

                  <Link
                    key={store.id}
                    to="/landing-page/$id"
                    params={{
                      id: String(store.id),
                    }}
                    className="text-gray-700 hover:text-purple-600 hover:underline"
                  >
                    {store.name}
                  </Link>

                ))}

              </div>

            </div>

          </section>

        ))}

      </section>

      <Footer />

    </main>
  );
}