import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import {
  ArrowLeft, ExternalLink, ShieldCheck, Truck, Star, ChevronRight,
  ThumbsUp, CheckCircle, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StarRating } from "@/components/product/StarRating";
import { ProductCard } from "@/components/product/ProductCard";
import {
  useGetProductBySlug,
  getGetProductBySlugQueryKey,
  useListProductReviews,
  getListProductReviewsQueryKey,
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

function StarBar({ rating, count, total }: { rating: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 text-muted-foreground text-right shrink-0">{rating}</span>
      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-xs text-muted-foreground shrink-0">{pct}%</span>
    </div>
  );
}

function ReviewCard({ review }: { review: { id: number; reviewerName: string; reviewerLocation?: string | null; rating: number; title: string; body: string; verifiedPurchase: boolean; helpfulCount: number; createdAt: string } }) {
  return (
    <div className="border rounded-xl p-5 bg-card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
            ))}
          </div>
          <h4 className="font-semibold text-sm">{review.title}</h4>
        </div>
        {review.verifiedPurchase && (
          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full shrink-0 font-medium">
            <CheckCircle className="w-3 h-3" /> Verified
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{review.body}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium">
          {review.reviewerName}
          {review.reviewerLocation && <span className="font-normal"> · {review.reviewerLocation}</span>}
        </span>
        <span className="flex items-center gap-1">
          <ThumbsUp className="w-3 h-3" /> {review.helpfulCount} found helpful
        </span>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const params = useParams();
  const slug = params.slug || "";

  const { data: product, isLoading: loadingProduct, error } = useGetProductBySlug(slug, {
    query: { enabled: !!slug, queryKey: getGetProductBySlugQueryKey(slug) },
  });

  const { data: reviewsData, isLoading: loadingReviews } = useListProductReviews(
    product?.id ?? 0,
    { query: { enabled: !!product?.id, queryKey: getListProductReviewsQueryKey(product?.id ?? 0) } }
  );

  const { data: relatedProducts } = useListProducts(
    { category: product?.category },
    {
      query: {
        enabled: !!product?.category,
        queryKey: getListProductsQueryKey({ category: product?.category }),
      },
    }
  );

  const filteredRelated = relatedProducts?.filter((p) => p.slug !== slug).slice(0, 4) || [];

  useEffect(() => {
    if (product?.title) {
      document.title = `${product.title} | DealHub`;
      // Inject JSON-LD structured data for SEO
      const existing = document.getElementById("product-jsonld");
      if (existing) existing.remove();
      const script = document.createElement("script");
      script.id = "product-jsonld";
      script.type = "application/ld+json";
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: product.description,
        image: product.imageUrl,
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: product.affiliateUrl,
        },
        ...(product.rating != null && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount ?? 0,
          },
        }),
      });
      document.head.appendChild(script);
    }
    return () => {
      document.getElementById("product-jsonld")?.remove();
    };
  }, [product]);

  const savingsPct =
    product?.originalPrice && product.originalPrice > product.price
      ? Math.round(100 - (product.price / product.originalPrice) * 100)
      : null;
  const savingsAmount =
    product?.originalPrice && product.originalPrice > product.price
      ? (product.originalPrice - product.price).toFixed(2)
      : null;

  const categoryLabel = product ? (categoryLabels[product.category] || product.category) : "";
  const breakdown = reviewsData?.ratingBreakdown;
  const totalReviews = reviewsData?.totalCount ?? 0;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-lg">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">This product doesn't exist or may have been removed.</p>
        <Button asChild>
          <Link href="/products">Browse All Deals</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-0">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
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
                <span className="text-foreground line-clamp-1 max-w-[240px]">{product.title}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back link */}
        <Link href="/products" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to all deals
        </Link>

        {/* Product Hero */}
        {loadingProduct || !product ? (
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <Skeleton className="aspect-square rounded-2xl w-full" />
            <div className="space-y-5 pt-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
            {/* Image */}
            <div className="bg-card border rounded-3xl p-8 relative sticky top-28 flex items-center justify-center min-h-[420px]">
              {product.badge && (
                <Badge className="absolute top-6 left-6 bg-primary text-primary-foreground border-transparent px-3 py-1 font-semibold text-sm">
                  {product.badge}
                </Badge>
              )}
              {savingsPct !== null && (
                <span className="absolute top-6 right-6 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-lg shadow">
                  {savingsPct}% OFF
                </span>
              )}
              <img
                src={product.imageUrl}
                alt={product.title}
                className="max-w-full max-h-[480px] object-contain mix-blend-multiply"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col gap-5">
              <div>
                <Link
                  href={`/products?category=${product.category}`}
                  className="text-primary font-semibold text-xs uppercase tracking-widest hover:underline"
                >
                  {categoryLabel}
                </Link>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-2 leading-tight">
                  {product.title}
                </h1>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <StarRating rating={product.rating} reviewCount={product.reviewCount} className="scale-110 origin-left" />
                {reviewsData && reviewsData.totalCount > 0 && (
                  <span className="text-sm text-muted-foreground border-l pl-3">{reviewsData.totalCount} reviews</span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-end gap-3 bg-muted/50 p-5 rounded-2xl border">
                <span className="text-5xl font-display font-bold leading-none">${product.price.toFixed(2)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="flex flex-col pb-1 gap-1">
                    <span className="text-lg text-muted-foreground line-through leading-none">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-md w-fit">
                      Save ${savingsAmount}
                    </span>
                  </div>
                )}
              </div>

              {/* Desktop CTA */}
              <div className="hidden md:flex flex-col gap-2">
                <Button asChild size="lg" className="w-full h-14 text-base font-bold shadow-xl group">
                  <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer">
                    Buy Now at Best Price
                    <ExternalLink className="w-5 h-5 ml-2 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Affiliate link — we may earn a small commission at no extra cost to you.
                </p>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: ShieldCheck, label: "Verified Seller" },
                  { icon: Truck, label: "Fast Shipping" },
                  { icon: CheckCircle, label: "Secure Link" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 text-xs font-medium bg-card border p-3 rounded-xl text-center">
                    <Icon className="w-5 h-5 text-primary" />
                    {label}
                  </div>
                ))}
              </div>

              {/* Quick description */}
              {product.description && (
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs: Description | Specifications | Reviews */}
        {product && (
          <Tabs defaultValue="specifications" className="mb-16">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-0 mb-8">
              {["specifications", "description", "reviews"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none capitalize px-5 py-3 font-semibold text-muted-foreground data-[state=active]:text-foreground"
                >
                  {tab === "reviews" ? `Reviews (${totalReviews})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Specifications Tab */}
            <TabsContent value="specifications">
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <div className="bg-card border rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value], i) => (
                        <tr key={key} className={i % 2 === 0 ? "bg-muted/40" : "bg-card"}>
                          <td className="px-5 py-3.5 font-semibold text-foreground w-1/3 border-r">{key}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Specifications not available for this product.</p>
              )}
            </TabsContent>

            {/* Description Tab */}
            <TabsContent value="description">
              <div className="max-w-3xl">
                {product.description ? (
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    {product.description.split(". ").filter(Boolean).map((sentence, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-0.5 shrink-0">—</span>
                        <p>{sentence.endsWith(".") ? sentence : `${sentence}.`}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No description available.</p>
                )}

                {/* Why buy from DealHub */}
                <div className="mt-10 bg-muted/40 rounded-2xl border p-6">
                  <h3 className="font-display font-bold mb-5 text-sm uppercase tracking-wider text-muted-foreground">
                    Why buy from DealHub?
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { icon: Star, label: "Curated Picks", desc: "Every product is hand-selected by our editorial team." },
                      { icon: ShieldCheck, label: "Best Price Guarantee", desc: "We only list the most competitive prices available online." },
                      { icon: ExternalLink, label: "Safe Affiliate Links", desc: "All affiliate links are verified, spam-free, and go directly to the retailer." },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div key={label} className="flex flex-col items-start gap-2">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <p className="font-semibold text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              {loadingReviews ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                </div>
              ) : reviewsData && reviewsData.reviews.length > 0 ? (
                <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
                  {/* Rating Summary */}
                  <div className="bg-card border rounded-2xl p-6 sticky top-28">
                    <div className="text-center mb-6">
                      <div className="text-6xl font-display font-bold mb-1">{product.rating?.toFixed(1)}</div>
                      <div className="flex justify-center mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-5 h-5 ${s <= Math.round(product.rating ?? 0) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{totalReviews.toLocaleString()} reviews</p>
                    </div>

                    {breakdown && (
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((r) => (
                          <StarBar
                            key={r}
                            rating={r}
                            count={breakdown[String(r) as keyof typeof breakdown]}
                            total={totalReviews}
                          />
                        ))}
                      </div>
                    )}

                    <div className="mt-6 pt-5 border-t">
                      <p className="text-xs text-muted-foreground text-center">
                        {reviewsData.reviews.filter((r) => r.verifiedPurchase).length} verified purchase reviews
                      </p>
                    </div>
                  </div>

                  {/* Review List */}
                  <div className="space-y-4">
                    {reviewsData.reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No reviews yet for this product.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Related Products */}
        {filteredRelated.length > 0 && (
          <div className="border-t pt-14">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold border-l-4 border-primary pl-3">
                Similar Deals
              </h2>
              {product && (
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link href={`/products?category=${product.category}`}>
                    View more in {categoryLabel}
                  </Link>
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRelated.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky buy button */}
      {product && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur border-t shadow-2xl p-4">
          <Button asChild size="lg" className="w-full h-14 text-base font-bold group">
            <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer">
              Buy Now — ${product.price.toFixed(2)}
              <ExternalLink className="w-4 h-4 ml-2 opacity-80" />
            </a>
          </Button>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            Affiliate link — we may earn a commission at no extra cost to you
          </p>
        </div>
      )}
    </div>
  );
}
