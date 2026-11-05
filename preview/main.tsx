/**
 * Preview entry: the real product pages (landing, Evidence Check, and the deeper
 * pages) with in-memory routing so they run as static files anywhere.
 */
import "../src/styles.css";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import { StudioProvider } from "@/lib/studio-store";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { ProductFooter, ProductHeader } from "@/components/landing/ProductChrome";
import { Landing } from "@/components/landing/Landing";
import { Route as CheckFile } from "../src/routes/check";
import { Route as ExampleFile } from "../src/routes/example";
import { Route as StudioFile } from "../src/routes/studio";
import { Route as FrameworkFile } from "../src/routes/framework";
import { Route as AboutFile } from "../src/routes/about";

function Shell() {
  const router = useRouter();
  const pathname = useLocation({ select: (l) => l.pathname });
  const product = pathname === "/" || pathname === "/check";

  // New page: start at the top, as a normal site would.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // In-page links such as "/#pricing" scroll instead of leaving the preview.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank") return;
      const href = a.getAttribute("href") ?? "";
      const m = href.match(/^\/?#(.+)$/);
      if (!m) return;
      e.preventDefault();
      const id = m[1]!;
      const go = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      if (href.startsWith("/") && router.state.location.pathname !== "/") {
        void router.navigate({ to: "/" }).then(() => window.setTimeout(go, 80));
      } else go();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  return (
    <div className={`relative z-10 flex min-h-screen flex-col ${product ? "product-shell" : ""}`}>
      {product ? <ProductHeader /> : <SiteHeader />}
      <main className="flex-1">
        <Outlet />
      </main>
      {product ? <ProductFooter /> : <SiteFooter />}
    </div>
  );
}

const rootRoute = createRootRoute({ component: Shell });
const page = (path: string, component: unknown) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path,
    component: component as () => React.ReactNode,
  });

const routeTree = rootRoute.addChildren([
  page("/", Landing),
  page("/check", CheckFile.options.component),
  page("/example", ExampleFile.options.component),
  page("/studio", StudioFile.options.component),
  page("/framework", FrameworkFile.options.component),
  page("/about", AboutFile.options.component),
]);

const router = createRouter({
  routeTree,
  history: createMemoryHistory({ initialEntries: ["/"] }),
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <StudioProvider>
        <RouterProvider router={router} />
      </StudioProvider>
    </QueryClientProvider>
  </StrictMode>,
);
