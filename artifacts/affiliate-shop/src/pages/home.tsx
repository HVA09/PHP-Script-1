import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, TrendingUp, Package, Tag, Sparkles, Search, Flame, Zap, Star, LayoutGrid, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useListProducts,
  getListProductsQueryKey,
  useGetProductStats,
  getGetProductStatsQueryKey,
  useListCategories,
  getListCategoriesQueryKey,
} from "@workspace/api-client-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";
import { useSEO } from "@/hooks/useSEO";

const categoryIcons: Record<string, string> = {
  electronics: "💻",
  fashion: "👗",
  "home-kitchen": "🏠",
  "sports-outdoors": "🏃",
  "beauty-health": "✨",
  books: "📚",
};

function CategoryStrip({ title, categorySlug, link, emoji }: { title: string; categorySlug: string; link: string; emoji?: string }) {
  const { data: products, isLoading } = useListProducts(
    { category: categorySlug },
    { query: { queryKey: getListProductsQueryKey({ category: categorySlug }) } }
  );

  return (
    <section className="container mx-auto px-4">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight border-l-4 border-primary pl-3 flex items-center gap-2">
            {emoji && <span>{emoji}</span>}
            {title}
          </h2>
        </div>
        <Button variant="ghost" asChild className="hidden sm:flex group shrink-0">
          <Link href={link}>
            View all
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-muted animate-pulse aspect-[4/3]" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible scrollbar-hide">
          {products?.slice(0, 4).map((product) => (
            <div key={product.id} className="min-w-[260px] lg:min-w-0 flex-shrink-0 lg:flex-shrink">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 sm:hidden">
        <Button variant="outline" asChild className="w-full">
          <Link href={link}>View all {title}</Link>
        </Button>
      </div>
    </section>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  useSEO({
    title: "DealHub — Global Affiliate Marketplace",
    description: "Discover the smartest deals on electronics, fashion, home goods, sports gear, beauty products, and books. Updated daily.",
    keywords: "deals, affiliate marketplace, best prices, electronics, fashion, home kitchen",
  });

  const { data: featuredProducts, isLoading: loadingFeatured } = useListProducts(
    { featured: true },
    { query: { queryKey: getListProductsQueryKey({ featured: true }) } }
  );

  const { data: allProducts, isLoading: loadingAll } = useListProducts(
    {},
    { query: { queryKey: getListProductsQueryKey({}) } }
  );

  const { data: stats, isLoading: loadingStats } = useGetProductStats({
    query: { queryKey: getGetProductStatsQueryKey() },
  });

  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });

  // Trending = highest review count (Best Sellers)
  const trendingProducts = useMemo(() => {
    if (!allProducts) return [];
    return [...allProducts].sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0)).slice(0, 8);
  }, [allProducts]);

  // Best deals = biggest discount %
  const bestDeals = useMemo(() => {
    if (!allProducts) return [];
    return [...allProducts]
      .filter((p) => p.originalPrice != null && p.originalPrice > p.price)
      .sort((a, b) => {
        const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return discB - discA;
      })
      .slice(0, 8);
  }, [allProducts]);

  // Top Rated = highest average rating
  const topRated = useMemo(() => {
    if (!allProducts) return [];
    return [...allProducts]
      .filter((p) => p.rating != null && p.rating >= 4)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 4);
  }, [allProducts]);

  // New Arrivals = highest IDs (most recently added)
  const newArrivals = useMemo(() => {
    if (!allProducts) return [];
    return [...allProducts].sort((a, b) => b.id - a.id).slice(0, 4);
  }, [allProducts]);

  const heroImages = featuredProducts?.slice(0, 4) ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero */}
      <section className="bg-accent text-accent-foreground min-h-[88vh] flex items-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center py-20">
          <div className="flex flex-col items-start text-left">
            <span className="inline-flex items-center gap-1.5 bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" /> Global Affiliate Marketplace · Updated Daily
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
              The smartest way to{" "}
              <span className="text-primary">shop smarter.</span>
            </h1>
            <p className="text-lg text-accent-foreground/75 max-w-lg mb-8 leading-relaxed">
              Discover curated, top-rated products from hundreds of global retailers at the lowest prices. We do the research so you don't have to.
            </p>
            <form onSubmit={handleSearch} className="relative w-full max-w-md mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for products, brands..."
                className="w-full pl-11 h-14 text-base bg-background text-foreground border-2 border-transparent focus-visible:ring-0 focus-visible:border-primary rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 font-semibold">
                Search
              </Button>
            </form>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button size="lg" asChild className="text-base font-semibold h-12 px-8">
                <Link href="/products">Shop All Deals</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="bg-transparent border-accent-foreground/20 hover:bg-accent-foreground/10 text-accent-foreground text-base font-semibold h-12 px-8"
              >
                <Link href="/categories">Browse Categories</Link>
              </Button>
            </div>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-3 mt-8">
              {[
                { icon: Package, label: `${stats?.totalProducts ?? "22"}+ Deals` },
                { icon: LayoutGrid, label: `${stats?.totalCategories ?? "6"} Categories` },
                { icon: Star, label: "Top-Rated Only" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-xs font-medium bg-accent-foreground/10 text-accent-foreground/80 px-3 py-1.5 rounded-full border border-accent-foreground/20">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: product mosaic */}
          {heroImages.length > 0 && (
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {heroImages.map((product, i) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className={`block bg-card rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 ${i === 0 ? "row-span-1" : ""}`}
                >
                  <div className="aspect-square relative">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover mix-blend-multiply"
                      loading="lazy"
                    />
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-md">
                        {product.badge}
                      </span>
                    )}
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                        {Math.round(100 - (product.price / product.originalPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-muted-foreground truncate">{product.title}</p>
                    <p className="text-sm font-bold text-foreground">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats bar */}
      <section className="container mx-auto px-4 -mt-32 relative z-20">
        <div className="bg-card rounded-2xl shadow-2xl border p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-border">
            {[
              { label: "Active Deals", value: loadingStats ? null : stats?.totalProducts, icon: Tag },
              { label: "Categories", value: loadingStats ? null : stats?.totalCategories, icon: Package },
              { label: "Featured Picks", value: loadingStats ? null : stats?.featuredCount, icon: Sparkles, accent: true },
              { label: "Avg. Savings", value: loadingStats ? null : "$47", icon: TrendingUp },
            ].map(({ label, value, icon: Icon, accent }) => (
              <div key={label} className="text-center px-4 py-2 md:py-0">
                <div className={`flex justify-center mb-2 ${accent ? "text-primary" : "text-muted-foreground"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className={`text-3xl font-display font-bold mb-0.5 ${accent ? "text-primary" : "text-foreground"}`}>
                  {value ?? "..."}
                </p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full">
                <Flame className="w-3.5 h-3.5" /> Trending Now
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight border-l-4 border-primary pl-3">
              Most Popular Deals
            </h2>
            <p className="text-muted-foreground mt-1 pl-4 text-sm">Products our community loves most — ranked by reviews.</p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:flex group">
            <Link href="/products">
              View all
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {loadingAll ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trendingProducts.map((product, i) => (
              <div key={product.id} className="relative">
                {i < 3 && (
                  <span className={`absolute -top-3 -left-3 z-30 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-md text-white ${
                    i === 0 ? "bg-amber-500" : i === 1 ? "bg-slate-400" : "bg-amber-700"
                  }`}>
                    #{i + 1}
                  </span>
                )}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Best Deals Banner */}
      {bestDeals.length > 0 && (
        <section className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-14">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    <Zap className="w-3.5 h-3.5" /> Limited Time
                  </span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Best Deals Right Now</h2>
                <p className="text-white/75 mt-1 text-sm">Biggest savings — before they're gone.</p>
              </div>
              <Button
                asChild
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 shrink-0"
              >
                <Link href="/products">
                  All deals <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible scrollbar-hide">
              {bestDeals.slice(0, 4).map((product) => {
                const savingsPct = product.originalPrice
                  ? Math.round(100 - (product.price / product.originalPrice) * 100)
                  : 0;
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="min-w-[240px] lg:min-w-0 flex-shrink-0 lg:flex-shrink bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl border border-white/20 group"
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-3 right-3 bg-green-400 text-green-950 text-sm font-black px-2.5 py-1 rounded-lg shadow-lg">
                        -{savingsPct}%
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">
                        {product.category.replace(/-/g, " ")}
                      </p>
                      <p className="text-white font-semibold text-sm line-clamp-2 mb-2">{product.title}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">${product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="text-white/50 text-sm line-through">${product.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Category grid */}
      <section className="bg-muted/50 border-y py-14">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-3">Shop by Category</h2>
            <p className="text-muted-foreground text-sm">From tech to home goods, find exactly what you need at the right price.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories?.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="bg-card border hover:border-primary/50 hover:shadow-md transition-all rounded-xl p-5 flex flex-col items-center justify-center text-center group"
              >
                <div className="text-3xl mb-3 group-hover:scale-125 transition-transform duration-300">
                  {categoryIcons[category.slug] ?? "🛍️"}
                </div>
                <h3 className="font-semibold text-sm mb-0.5">{category.name}</h3>
                <p className="text-xs text-muted-foreground">{category.productCount} deals</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/categories">
                Explore All Categories
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Category Strips */}
      <CategoryStrip title="Electronics" categorySlug="electronics" link="/products?category=electronics" emoji="💻" />
      <CategoryStrip title="Fashion" categorySlug="fashion" link="/products?category=fashion" emoji="👗" />

      {/* Top Rated */}
      {topRated.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5" /> Top Rated
                </span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight border-l-4 border-amber-400 pl-3">
                Highest Rated Products
              </h2>
              <p className="text-muted-foreground mt-1 pl-4 text-sm">Rated 4★ and above by verified buyers.</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex group">
              <Link href="/products?sort=rating">
                View all <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          {loadingAll ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topRated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

      <CategoryStrip title="Home & Kitchen" categorySlug="home-kitchen" link="/products?category=home-kitchen" emoji="🏠" />

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" /> New Arrivals
                </span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight border-l-4 border-blue-400 pl-3">
                Just Added
              </h2>
              <p className="text-muted-foreground mt-1 pl-4 text-sm">The freshest picks, added to DealHub recently.</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex group">
              <Link href="/products?sort=newest">
                View all <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          {loadingAll ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <div key={product.id} className="relative">
                  <span className="absolute -top-2 -right-2 z-30 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">NEW</span>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <CategoryStrip title="Sports & Outdoors" categorySlug="sports-outdoors" link="/products?category=sports-outdoors" emoji="🏃" />

      {/* More Best Deals (bottom rows) */}
      {bestDeals.length > 4 && (
        <section className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight border-l-4 border-green-500 pl-3 flex items-center gap-2">
              <Zap className="w-6 h-6 text-green-500" /> More Great Deals
            </h2>
            <Button variant="ghost" asChild className="hidden sm:flex group">
              <Link href="/products">
                See all
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestDeals.slice(4, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Featured section */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <Badge className="mb-2 bg-primary/10 text-primary border-transparent">Editor's Picks</Badge>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight border-l-4 border-primary pl-3">
              Featured Products
            </h2>
          </div>
          <Button variant="ghost" asChild className="hidden sm:flex group">
            <Link href="/products?featured=true">
              View all featured
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {loadingFeatured ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
