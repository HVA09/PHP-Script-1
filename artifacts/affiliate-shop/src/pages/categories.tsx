import { useEffect } from "react";
import { Link } from "wouter";
import { ChevronRight, Laptop, Shirt, Home, Dumbbell, Sparkles, BookOpen, ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product/ProductCard";
import {
  useListCategories,
  getListCategoriesQueryKey,
  useListProducts,
  getListProductsQueryKey,
} from "@workspace/api-client-react";

const categoryMeta: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  description: string;
  gradient: string;
  accent: string;
}> = {
  electronics: {
    icon: Laptop,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    description: "Headphones, TVs, laptops, tablets and cutting-edge gadgets at unbeatable prices.",
    gradient: "from-blue-600 to-indigo-700",
    accent: "bg-blue-100 text-blue-700",
  },
  fashion: {
    icon: Shirt,
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
    description: "Premium sneakers, jeans, jackets and accessories from the world's top brands.",
    gradient: "from-pink-500 to-rose-600",
    accent: "bg-pink-100 text-pink-700",
  },
  "home-kitchen": {
    icon: Home,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    description: "Everything for your kitchen and home — from Instant Pots to Le Creuset Dutch ovens.",
    gradient: "from-green-500 to-emerald-700",
    accent: "bg-green-100 text-green-700",
  },
  "sports-outdoors": {
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    description: "GPS watches, resistance bands, water bottles and gear for every workout and adventure.",
    gradient: "from-orange-500 to-amber-600",
    accent: "bg-orange-100 text-orange-700",
  },
  "beauty-health": {
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
    description: "Dermatologist-approved skincare, electric toothbrushes and wellness essentials.",
    gradient: "from-purple-500 to-violet-700",
    accent: "bg-purple-100 text-purple-700",
  },
  books: {
    icon: BookOpen,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
    description: "Bestselling self-help, finance and productivity books to sharpen your mind.",
    gradient: "from-amber-500 to-yellow-600",
    accent: "bg-amber-100 text-amber-700",
  },
};

function CategorySection({ slug, name, productCount }: { slug: string; name: string; productCount: number }) {
  const meta = categoryMeta[slug];
  const Icon = meta?.icon ?? Sparkles;

  const { data: products, isLoading } = useListProducts(
    { category: slug },
    { query: { queryKey: getListProductsQueryKey({ category: slug }) } }
  );

  return (
    <section id={slug} className="scroll-mt-24">
      {/* Category header */}
      <div className={`relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-r ${meta?.gradient ?? "from-primary to-primary/80"}`}>
        {meta?.image && (
          <img
            src={meta.image}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
          />
        )}
        <div className="relative z-10 p-8 md:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center shrink-0">
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">{name}</h2>
              <p className="text-white/75 text-sm mt-1 max-w-sm">{meta?.description}</p>
            </div>
          </div>
          <Button
            asChild
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shrink-0"
          >
            <Link href={`/products?category=${slug}`}>
              View all {productCount} deals
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Products grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products?.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {(products?.length ?? 0) > 4 && (
        <div className="mt-6 text-center">
          <Button variant="outline" asChild>
            <Link href={`/products?category=${slug}`}>
              See all {productCount} {name} deals
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}

export default function Categories() {
  const { data: categories, isLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });

  useEffect(() => {
    document.title = "All Categories | DealHub";
  }, []);

  return (
    <div className="pb-20">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">All Categories</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-1.5 bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-sm font-semibold mb-5">
            <TrendingUp className="w-4 h-4" /> 6 Curated Categories
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Shop by Category
          </h1>
          <p className="text-accent-foreground/70 max-w-xl mx-auto">
            Hand-curated products across every lifestyle. Discover the best deals in electronics, fashion, home goods, and more.
          </p>
        </div>
      </section>

      {/* Category quick-nav */}
      <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {isLoading
              ? [1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-8 w-28 rounded-full shrink-0" />)
              : categories?.map((cat) => {
                  const meta = categoryMeta[cat.slug];
                  const Icon = meta?.icon ?? Sparkles;
                  return (
                    <a
                      key={cat.id}
                      href={`#${cat.slug}`}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0 border transition-all ${
                        meta?.accent ?? "bg-primary/10 text-primary"
                      } border-transparent hover:shadow-sm`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.name}
                      <Badge variant="outline" className="ml-1 h-4 text-[10px] px-1 border-current opacity-70">
                        {cat.productCount}
                      </Badge>
                    </a>
                  );
                })}
          </div>
        </div>
      </div>

      {/* Category sections */}
      <div className="container mx-auto px-4 py-12 space-y-20">
        {isLoading
          ? [1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-40 rounded-2xl mb-8" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((j) => <Skeleton key={j} className="aspect-[4/3] rounded-xl" />)}
                </div>
              </div>
            ))
          : categories?.map((cat) => (
              <CategorySection key={cat.id} slug={cat.slug} name={cat.name} productCount={cat.productCount} />
            ))}
      </div>
    </div>
  );
}
