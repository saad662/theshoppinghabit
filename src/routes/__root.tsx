import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { InteractiveCursor } from "@/components/InteractiveCursor";
import { Toaster } from "@/components/ui/sonner";
import { organizationLd, websiteLd } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/*
        This route still returns HTTP 200 (static hosting has no way to
        signal a real 404 for a client-side-routed SPA), so without this
        the page would otherwise be indexable — a classic "soft 404".
      */}
      <meta name="robots" content="noindex, nofollow" />
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <meta name="robots" content="noindex, nofollow" />
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
  head: () => ({
    meta: [
      { property: "og:site_name", content: "TheShoppingHabit" },
      { name: "twitter:card", content: "summary_large_image" },
      { "script:ld+json": organizationLd() },
      { "script:ld+json": websiteLd() },
    ],
  }),
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // The static index.html ships fallback <title>/<meta> tags (marked
  // data-default) so non-JS crawlers and the pre-hydration paint have
  // something. By the time this effect runs, <HeadContent /> has already
  // committed the real per-route tags, so the fallbacks can be dropped —
  // otherwise they'd sit in the document alongside the real ones forever.
  useEffect(() => {
    document.querySelectorAll('[data-default="true"]').forEach((el) => el.remove());
  }, []);

  // The custom cursor is part of the original landing page's look, which
  // stays unchanged — everywhere else on the new site uses the normal
  // system cursor.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLandingPage = pathname.startsWith("/landing-page/");

  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      {isLandingPage && <InteractiveCursor />}
      <Outlet />
      <Toaster position="bottom-center" richColors />
    </QueryClientProvider>
  );
}
