import { Link } from "wouter";
import { ArrowRight, Tag, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  useListProducts, 
  getListProductsQueryKey,
  useGetProductStats,
  getGetProductStatsQueryKey,
  useListCategories,
  getListCategoriesQueryKey
} from "@workspace/api-client-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { data: featuredProducts, isLoading: loadingProducts } = useListProducts(
    { featured: true }, 
    { query: { queryKey: getListProductsQueryKey({ featured: true }) } }
  );

  const { data: stats, isLoading: loadingStats } = useGetProductStats({
    query: { queryKey: getGetProductStatsQueryKey() }
  });

  const { data: categories, isLoading: loadingCategories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="bg-accent text-accent-foreground py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 mb-6 px-3 py-1 text-sm font-semibold rounded-full">
            <Zap className="w-4 h-4 mr-1 inline-block" /> Hand-picked deals updated daily
          </Badge>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mb-6">
            The smartest way to <span className="text-primary">shop smarter.</span>
          </h1>
          <p className="text-lg md:text-xl text-accent-foreground/80 max-w-2xl mb-10 leading-relaxed">
            Discover curated, top-rated products at unbeatable prices. We cut through the noise so you never pay retail again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" asChild className="text-base font-semibold h-14 px-8">
              <Link href="/products">Shop All Deals</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-accent-foreground/20 hover:bg-accent-foreground/10 text-accent-foreground text-base font-semibold h-14 px-8">
              Browse Categories
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="container mx-auto px-4 -mt-24 relative z-20">
        <div className="bg-card rounded-xl shadow-xl border p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border">
            <div className="text-center px-4">
              <p className="text-3xl font-display font-bold text-foreground mb-1">
                {loadingStats ? "..." : stats?.totalProducts.toLocaleString()}
              </p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Deals</p>
            </div>
            <div className="text-center px-4">
              <p className="text-3xl font-display font-bold text-foreground mb-1">
                {loadingStats ? "..." : stats?.totalCategories.toLocaleString()}
              </p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Categories</p>
            </div>
            <div className="text-center px-4">
              <p className="text-3xl font-display font-bold text-primary mb-1">
                {loadingStats ? "..." : stats?.featuredCount.toLocaleString()}
              </p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Featured</p>
            </div>
            <div className="text-center px-4">
              <p className="text-3xl font-display font-bold text-foreground mb-1">
                {loadingStats ? "..." : stats?.avgPrice ? `$${stats.avgPrice.toFixed(0)}` : "-"}
              </p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg Price</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
              <TrendingUp className="text-primary w-8 h-8" /> 
              Trending Today
            </h2>
            <p className="text-muted-foreground">Our editors' top picks right now.</p>
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
            {featuredProducts?.slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        <div className="mt-8 sm:hidden flex justify-center">
          <Button variant="outline" asChild className="w-full">
            <Link href="/products?featured=true">View all featured</Link>
          </Button>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-muted/50 py-16 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold tracking-tight mb-4">Shop by Category</h2>
            <p className="text-muted-foreground">From tech to home goods, find exactly what you're looking for at the right price.</p>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-card rounded-xl animate-pulse border"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories?.map(category => (
                <Link 
                  key={category.id} 
                  href={`/products?category=${category.slug}`}
                  className="bg-card border hover:border-primary/50 hover:shadow-md transition-all rounded-xl p-6 flex flex-col items-center justify-center text-center group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Tag className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.productCount} deals</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
