import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ExternalLink, ShieldCheck, Truck, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/product/StarRating";
import { ProductCard } from "@/components/product/ProductCard";
import {
  useGetProduct,
  getGetProductQueryKey,
  useListProducts,
  getListProductsQueryKey,
} from "@workspace/api-client-react";

const categoryLabels: Record<string, string> = {
  electronics: "Electronics",
  fashion: "Fashion",
  "home-kitchen": "Home & Kitchen",
  "sports-outdoors": "Sports & Outdoors",
  "beauty-health": "Beauty & Health",
  books: "Books",
};

export default function ProductDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);

  const { data: product, isLoading: loadingProduct, error } = useGetProduct(id, {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id) },
  });

  const { data: relatedProducts, isLoading: loadingRelated } = useListProducts(
    { category: product?.category },
    {
      query: {
        enabled: !!product?.category,
        queryKey: getListProductsQueryKey({ category: product?.category }),
      },
    }
  );

  const filteredRelated = relatedProducts?.filter((p) => p.id !== id).slice(0, 4) || [];

  useEffect(() => {
    if (product?.title) {
      document.title = `${product.title} | DealHub`;
    } else {
      document.title = "Product | DealHub";
    }
  }, [product?.title]);

  const savingsAmount = product?.originalPrice && product.originalPrice > product.price
    ? (product.originalPrice - product.price).toFixed(2)
    : null;
  const savingsPct = product?.originalPrice && product.originalPrice > product.price
    ? Math.round(100 - (product.price / product.originalPrice) * 100)
    : null;

  const categoryLabel = product ? (categoryLabels[product.category] || product.category) : "";

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/products">Browse All Deals</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8 flex-wrap">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <Link href="/products" className="hover:text-foreground transition-colors">All Deals</Link>
        {product && (
          <>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <Link href={`/products?category=${product.category}`} className="hover:text-foreground transition-colors">
              {categoryLabel}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-foreground line-clamp-1 max-w-[200px]">{product.title}</span>
          </>
        )}
      </nav>

      {loadingProduct || !product ? (
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <Skeleton className="aspect-square rounded-2xl w-full" />
          <div className="space-y-6 pt-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-12 items-start mb-20">
          {/* Image */}
          <div className="bg-card border rounded-3xl p-8 relative sticky top-28 flex items-center justify-center min-h-[440px]">
            {product.badge && (
              <Badge className="absolute top-6 left-6 bg-primary text-primary-foreground border-transparent px-3 py-1 font-semibold">
                {product.badge}
              </Badge>
            )}
            {savingsPct !== null && (
              <span className="absolute top-6 right-6 bg-green-500 text-white text-sm font-bold px-2.5 py-1 rounded-md">
                {savingsPct}% OFF
              </span>
            )}
            <img
              src={product.imageUrl}
              alt={product.title}
              className="max-w-full max-h-[500px] object-contain mix-blend-multiply"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="mb-5">
              <Link
                href={`/products?category=${product.category}`}
                className="text-primary font-semibold text-xs uppercase tracking-widest hover:underline"
              >
                {categoryLabel}
              </Link>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-2 mb-4 leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <StarRating rating={product.rating} reviewCount={product.reviewCount} className="scale-110 origin-left" />
                {product.reviewCount && (
                  <span className="text-muted-foreground text-sm border-l pl-3 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    Verified Reviews
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-6 bg-muted/50 p-5 rounded-2xl border">
              <span className="text-5xl font-display font-bold leading-none">${product.price.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="flex flex-col pb-1 gap-1">
                  <span className="text-lg text-muted-foreground line-through leading-none">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-md">
                    Save ${savingsAmount} ({savingsPct}% off)
                  </span>
                </div>
              )}
            </div>

            {/* CTA — hidden on mobile (sticky bar handles it) */}
            <div className="hidden md:block mb-4">
              <Button asChild size="lg" className="w-full h-14 text-base font-bold shadow-xl group">
                <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer">
                  Buy Now at Best Price
                  <ExternalLink className="w-5 h-5 ml-2 opacity-80 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mb-6 hidden md:block">
              Affiliate Disclosure: As an affiliate partner, we may earn a commission at no extra cost to you.
            </p>

            {/* Trust signals */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="flex items-center gap-2.5 text-sm font-medium bg-card border p-3 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                Verified Seller
              </div>
              <div className="flex items-center gap-2.5 text-sm font-medium bg-card border p-3 rounded-lg">
                <Truck className="w-5 h-5 text-primary shrink-0" />
                Fast Shipping
              </div>
            </div>

            {/* Why buy from DealHub */}
            <div className="bg-muted/40 rounded-2xl border p-5 mb-8">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Why buy from DealHub?</h3>
              <ul className="space-y-3">
                {[
                  { icon: Star, label: "Curated Picks", desc: "Every product is hand-selected by our editors." },
                  { icon: ShieldCheck, label: "Best Price Guarantee", desc: "We only list the most competitive prices available." },
                  { icon: ExternalLink, label: "Safe & Secure Links", desc: "All affiliate links are verified and spam-free." },
                ].map(({ icon: Icon, label, desc }) => (
                  <li key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-3">
                <h3 className="font-display text-lg font-bold border-b pb-2">Why we love it</h3>
                <div className="text-muted-foreground text-sm leading-relaxed space-y-2">
                  {product.description.includes("\n")
                    ? product.description.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)
                    : product.description.split(". ").filter(Boolean).map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5 shrink-0">•</span>
                          <span>{s.endsWith(".") ? s : `${s}.`}</span>
                        </div>
                      ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Related Products */}
      {!loadingRelated && filteredRelated.length > 0 && (
        <div className="border-t pt-14 mt-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold border-l-4 border-primary pl-3">Similar Deals</h2>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href={`/products?category=${product?.category}`}>
                View more in {categoryLabel}
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRelated.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile sticky CTA */}
      {product && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t shadow-2xl p-4">
          <Button asChild size="lg" className="w-full h-14 text-base font-bold group">
            <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer">
              Buy Now — ${product.price.toFixed(2)}
              <ExternalLink className="w-5 h-5 ml-2 opacity-80" />
            </a>
          </Button>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Affiliate link — we may earn a commission at no extra cost to you
          </p>
        </div>
      )}
    </div>
  );
}
