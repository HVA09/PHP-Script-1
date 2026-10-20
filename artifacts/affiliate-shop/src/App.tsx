import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { useSEO } from "@/hooks/useSEO";
import { WishlistProvider } from "@/context/WishlistContext";
import { CompareProvider } from "@/context/CompareContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import Home from "@/pages/home";
const Products = lazy(() => import("@/pages/products"));
const ProductDetail = lazy(() => import("@/pages/product-detail"));
const Categories = lazy(() => import("@/pages/categories"));
const Wishlist = lazy(() => import("@/pages/wishlist"));
const Compare = lazy(() => import("@/pages/compare"));
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const Blog = lazy(() => import("@/pages/blog"));
const BlogPost = lazy(() => import("@/pages/blog-post"));
const Profile = lazy(() => import("@/pages/profile"));
const Alerts = lazy(() => import("@/pages/alerts"));
const Admin = lazy(() => import("@/pages/admin"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={Admin} />
      <Route path="/admin/products" component={Admin} />
      <Route path="/admin/categories" component={Admin} />
      <Route path="/admin/affiliate-links" component={Admin} />
      <Route path="/admin/reviews" component={Admin} />
      <Layout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/products/:slug" component={ProductDetail} />
          <Route path="/categories" component={Categories} />
          <Route path="/wishlist" component={Wishlist} />
          <Route path="/compare" component={Compare} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:slug" component={BlogPost} />
          <Route path="/profile" component={Profile} />
          <Route path="/alerts" component={Alerts} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </Switch>
  );
}

function GlobalSeo() {
  const [location] = useLocation();
  const { language } = useLanguage();
  const cleanPath = location.split("?")[0] || "/";
  const isPrivate = ["/admin", "/profile", "/alerts", "/wishlist", "/compare"].some(
    (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`),
  );
  const routeMeta = cleanPath === "/"
    ? {
        title: language === "ar" ? "أفضل العروض والمنتجات | DealHub" : "Best Deals & Products | DealHub",
        description: language === "ar" ? "اكتشف أفضل العروض المختارة على الإلكترونيات والأزياء والمنزل وأكثر مع DealHub." : "Discover curated deals on electronics, fashion, home goods, and more with DealHub.",
      }
    : cleanPath.startsWith("/products/")
      ? { title: language === "ar" ? "تفاصيل المنتج | DealHub" : "Product details | DealHub", description: "Explore product details, reviews, prices, and trusted affiliate links on DealHub." }
      : cleanPath.startsWith("/blog")
        ? { title: language === "ar" ? "مدونة DealHub | مراجعات وأدلة الشراء" : "DealHub Blog | Reviews & Buying Guides", description: "Practical product reviews and buying guides to help you shop smarter." }
        : cleanPath === "/categories"
          ? { title: language === "ar" ? "تسوق حسب التصنيف | DealHub" : "Shop by Category | DealHub", description: "Browse DealHub's curated product categories and find your next great deal." }
          : cleanPath === "/products"
            ? { title: language === "ar" ? "كل العروض | DealHub" : "All Deals | DealHub", description: "Browse the latest curated products and price drops from DealHub." }
            : { title: "DealHub", description: "DealHub is your trusted source for curated products, reviews, and better prices." };

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const base = import.meta.env.BASE_URL || "/";
  const canonical = `${origin}${base.replace(/\/$/, "")}${cleanPath === "/" ? "/" : cleanPath}`;
  const image = `${origin}${base.replace(/\/$/, "")}/opengraph.jpg`;
  useSEO({ ...routeMeta, canonical, image, noIndex: isPrivate });
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-route", cleanPath);
  }, [cleanPath]);
  return <GoogleAnalytics path={location} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <RecentlyViewedProvider>
            <WishlistProvider>
              <CompareProvider>
                <TooltipProvider>
                  <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                    <GlobalSeo />
                    <Suspense fallback={<div className="min-h-screen bg-background" />}>
                      <Router />
                    </Suspense>
                  </WouterRouter>
                  <Toaster />
                </TooltipProvider>
              </CompareProvider>
            </WishlistProvider>
          </RecentlyViewedProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
