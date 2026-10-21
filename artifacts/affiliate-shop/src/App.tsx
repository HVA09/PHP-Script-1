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
  const isProductDetail = /^\/products\/[^/]+\/?$/.test(cleanPath);
  const isBlogPost = /^\/blog\/[^/]+\/?$/.test(cleanPath);
  const routeMeta = cleanPath === "/"
    ? {
        title: language === "ar" ? "أفضل عروض المنتجات | DealHub" : "Best Product Deals & Reviews",
        description: language === "ar"
          ? "اكتشف عروضاً مختارة على الإلكترونيات والأزياء والمنزل والرياضة والجمال والكتب، وقارن التفاصيل والأسعار عبر DealHub."
          : "Find curated deals across electronics, fashion, home, fitness, beauty, and books. Compare product details and retailer prices with DealHub.",
      }
    : isProductDetail
      ? { title: language === "ar" ? "تفاصيل المنتج" : "Product details", description: "Explore product details, specifications, pricing, and retailer links on DealHub." }
      : cleanPath === "/blog"
        ? { title: language === "ar" ? "مدونة DealHub | مراجعات وأدلة الشراء" : "Product Reviews & Buying Guides", description: "Read product reviews, comparisons, and practical buying guides to help you compare features and shop with confidence." }
        : isBlogPost
          ? { title: language === "ar" ? "مقال من مدونة DealHub" : "DealHub article", description: "Read product reviews and practical buying advice from the DealHub editorial team." }
        : cleanPath === "/categories"
          ? { title: language === "ar" ? "تسوق حسب التصنيف | DealHub" : "Shop Deals by Category", description: "Explore curated deals by category, including electronics, fashion, home, sports, beauty, and books." }
          : cleanPath === "/products"
            ? { title: language === "ar" ? "كل العروض | DealHub" : "Curated Product Deals & Price Drops", description: "Browse curated products across electronics, fashion, home, sports, beauty, and books. Compare specifications, current prices, and available discounts." }
            : cleanPath === "/about"
              ? { title: language === "ar" ? "من نحن | DealHub" : "About DealHub", description: "Learn how DealHub helps shoppers discover products with useful details, category browsing, price comparisons, and direct retailer links." }
              : cleanPath === "/contact"
                ? { title: language === "ar" ? "اتصل بنا | DealHub" : "Contact DealHub", description: "Contact the DealHub team about products, listings, retailer links, or site feedback. Send us a message and we will get back to you." }
                : cleanPath === "/privacy"
                  ? { title: language === "ar" ? "سياسة الخصوصية | DealHub" : "Privacy Policy", description: "Read how DealHub handles account information, saved products, browsing activity, and data used to operate the shopping service." }
                  : cleanPath === "/terms"
                    ? { title: language === "ar" ? "شروط الاستخدام | DealHub" : "Terms of Use", description: "Review the terms for using DealHub, including product information, retailer links, affiliate disclosures, and service limitations." }
                    : cleanPath === "/compare"
                      ? { title: language === "ar" ? "مقارنة المنتجات | DealHub" : "Compare Products", description: "Compare product details, specifications, and current prices side by side on DealHub." }
                      : { title: "DealHub — Curated Product Deals", description: "Discover curated product deals, clear specifications, and retailer links across popular shopping categories with DealHub." };

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const base = import.meta.env.BASE_URL || "/";
  const canonicalPath = `${base.replace(/\/$/, "")}${cleanPath === "/" ? "/" : cleanPath}`;
  const canonical = origin ? new URL(canonicalPath, origin).href : undefined;
  const image = `${base.replace(/\/$/, "")}/opengraph.jpg`;
  useSEO({ ...routeMeta, canonical, image, noIndex: isPrivate, enabled: !isProductDetail && !isBlogPost });
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
