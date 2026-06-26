import { Link, useParams } from "wouter";
import { ArrowLeft, ExternalLink, ShieldCheck, Truck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/product/StarRating";
import { ProductCard } from "@/components/product/ProductCard";
import { 
  useGetProduct, 
  getGetProductQueryKey,
  useListProducts,
  getListProductsQueryKey
} from "@workspace/api-client-react";

export default function ProductDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);

  const { data: product, isLoading: loadingProduct, error } = useGetProduct(
    id, 
    { query: { enabled: !!id, queryKey: getGetProductQueryKey(id) } }
  );

  // Fetch related products from same category
  const { data: relatedProducts, isLoading: loadingRelated } = useListProducts(
    { category: product?.category },
    { 
      query: { 
        enabled: !!product?.category, 
        queryKey: getListProductsQueryKey({ category: product?.category }) 
      } 
    }
  );

  const filteredRelated = relatedProducts?.filter(p => p.id !== id).slice(0, 4) || [];

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
      <Link href="/products" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to all deals
      </Link>

      {loadingProduct || !product ? (
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <Skeleton className="aspect-square rounded-2xl w-full" />
          <div className="space-y-6 pt-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-32" />
            <div className="pt-8 space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-12 items-start mb-20">
          {/* Image Gallery area */}
          <div className="bg-card border rounded-3xl p-8 relative sticky top-24 flex items-center justify-center min-h-[500px]">
            {product.badge && (
              <Badge className="absolute top-6 left-6 text-sm px-3 py-1 bg-primary/20 text-primary border-primary/20">
                {product.badge}
              </Badge>
            )}
            <img 
              src={product.imageUrl} 
              alt={product.title} 
              className="max-w-full max-h-[600px] object-contain mix-blend-multiply"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <Link href={`/products?category=${product.category}`} className="text-primary font-semibold text-sm uppercase tracking-wider hover:underline">
                {product.category}
              </Link>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mt-2 mb-4 leading-[1.1]">
                {product.title}
              </h1>
              
              <div className="flex items-center gap-4 flex-wrap">
                <StarRating rating={product.rating} reviewCount={product.reviewCount} className="scale-110 origin-left" />
                <span className="text-muted-foreground text-sm border-l pl-4">Verified Reviews</span>
              </div>
            </div>

            <div className="flex items-end gap-3 mb-8 bg-muted/50 p-6 rounded-2xl border">
              <span className="text-5xl font-display font-bold text-foreground leading-none">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="flex flex-col pb-1">
                  <span className="text-lg text-muted-foreground line-through decoration-muted-foreground/50 leading-none mb-1">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-md inline-block w-fit leading-none">
                    Save ${((product.originalPrice - product.price)).toFixed(2)} ({(100 - (product.price / product.originalPrice * 100)).toFixed(0)}%)
                  </span>
                </div>
              )}
            </div>

            <Button asChild size="lg" className="w-full h-16 text-lg font-bold shadow-xl mb-8 group">
              <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer">
                Buy Now at Best Price
                <ExternalLink className="w-5 h-5 ml-2 opacity-80 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </Button>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="flex items-center gap-3 text-sm font-medium bg-card border p-3 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>Verified Seller</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium bg-card border p-3 rounded-lg">
                <Truck className="w-5 h-5 text-primary" />
                <span>Fast Shipping</span>
              </div>
            </div>

            {product.description && (
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold border-b pb-2">Why we love it</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                  {/* Basic text formatting simulation since we don't have rich HTML in DB */}
                  {product.description.split('\n').map((paragraph, i) => 
                    paragraph.trim() ? <p key={i}>{paragraph}</p> : null
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Related Products */}
      {!loadingRelated && filteredRelated.length > 0 && (
        <div className="border-t pt-16 mt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-bold">Similar Deals</h2>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href={`/products?category=${product?.category}`}>
                View more {product?.category}
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRelated.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
