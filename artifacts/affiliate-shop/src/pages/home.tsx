import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, TrendingUp, Package, Tag, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
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

function CategoryStrip({ title, categorySlug, link }: { title: string; categorySlug: string; link: string }) {
  const { data: products, isLoading } = useListProducts(
    { category: categorySlug },
    { query: { queryKey: getListProductsQueryKey({ category: categorySlug }) } }
  );

  return (
    <section className="container mx-auto px-4">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight border-l-4 border-primary pl-3">
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

  useEffect(() => {
    document.title = "DealHub - Best Deals and Affiliate Products";
  }, []);

  const { data: featuredProducts, isLoading: loadingProducts } = useListProducts(
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
      <section className="bg-accent text-accent-foreground min-h-[85vh] flex items-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center py-20">
          {/* Left */}
          <div className="flex flex-col items-start text-left">
            <span className="inline-flex items-center gap-1.5 bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" /> Hand-picked deals updated daily
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
              The smartest way to{" "}
              <span className="text-primary">shop smarter.</span>
            </h1>
            <p className="text-lg text-accent-foreground/75 max-w-lg mb-8 leading-relaxed">
              Discover curated, top-rated products at unbeatable prices. We cut through the noise so you never pay retail again.
            </p>
            <form onSubmit={handleSearch} className="relative w-full max-w-md mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for products..."
                className="w-full pl-11 h-14 text-base bg-background text-foreground border-2 border-transparent focus-visible:ring-0 focus-visible:border-primary rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 font-semibold"
              >
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
                <Link href="/products?featured=true">Featured Picks</Link>
              </Button>
            </div>
          </div>

          {/* Right: product mosaic */}
          {heroImages.length > 0 && (
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {heroImages.map((product, i) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
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

      {/* Stats Bar */}
      <section className="container mx-auto px-4 -mt-32 relative z-20">
        <div className="bg-card rounded-2xl shadow-2xl border p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-border">
            {[
              { label: "Active Deals", value: loadingStats ? null : stats?.totalProducts, icon: Tag },
              { label: "Categories", value: loadingStats ? null : stats?.totalCategories, icon: Package },
              { label: "Featured Picks", value: loadingStats ? null : stats?.featuredCount, icon: Sparkles, accent: true },
              { label: "Avg. Price", value: loadingStats ? null : stats?.avgPrice ? `$${stats.avgPrice.toFixed(0)}` : "-", icon: TrendingUp },
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

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight border-l-4 border-primary pl-3">
              Trending Today
            </h2>
            <p className="text-muted-foreground mt-1 pl-4 text-sm">Our editors' top picks right now.</p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:flex group">
            <Link href="/products?featured=true">
              View all featured
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {loadingProducts ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts?.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-6 sm:hidden">
          <Button variant="outline" asChild className="w-full">
            <Link href="/products?featured=true">View all featured</Link>
          </Button>
        </div>
      </section>

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
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm mb-0.5">{category.name}</h3>
                <p className="text-xs text-muted-foreground">{category.productCount} deals</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category Strips */}
      <CategoryStrip title="Electronics" categorySlug="electronics" link="/products?category=electronics" />
      <CategoryStrip title="Fashion" categorySlug="fashion" link="/products?category=fashion" />
      <CategoryStrip title="Home & Kitchen" categorySlug="home-kitchen" link="/products?category=home-kitchen" />

      {/* New Arrivals */}
      {!loadingAll && allProducts && allProducts.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight border-l-4 border-primary pl-3">
              New Arrivals
            </h2>
            <Button variant="ghost" asChild className="hidden sm:flex group">
              <Link href="/products">
                Browse all
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allProducts.slice(-4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
