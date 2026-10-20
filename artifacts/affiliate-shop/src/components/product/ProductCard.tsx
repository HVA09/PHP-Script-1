import { Link } from "wouter";
import { Heart, ExternalLink, GitCompare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import type { Product } from "@workspace/api-client-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import { trackAffiliateClick, buildAffiliateUrl } from "@/lib/affiliateTracking";

interface ProductCardProps {
  product: Product;
  hideCompare?: boolean;
}

const categoryColors: Record<string, string> = {
  electronics: "bg-blue-100 text-blue-700",
  fashion: "bg-pink-100 text-pink-700",
  "home-kitchen": "bg-green-100 text-green-700",
  "sports-outdoors": "bg-orange-100 text-orange-700",
  "beauty-health": "bg-purple-100 text-purple-700",
  books: "bg-amber-100 text-amber-700",
};

export function ProductCard({ product, hideCompare = false }: ProductCardProps) {
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const { toggleCompare, isInCompare, atLimit } = useCompare();
  const wishlisted = isWishlisted(product.id);
  const inCompare = isInCompare(product.id);

  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(100 - (product.price / product.originalPrice) * 100)
      : null;

  const categoryColor = categoryColors[product.category] ?? "bg-primary/10 text-primary";
  const affiliateUrl = buildAffiliateUrl(product.affiliateUrl, product.slug);

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-primary/30 group">
      <CardHeader className="p-0 relative aspect-[4/3] bg-muted overflow-hidden">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10" aria-label={`View ${product.title}`}>
          <span className="sr-only">View {product.title}</span>
        </Link>
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
          loading="lazy"
        />
        {product.badge && (
          <div className="absolute top-3 left-3 z-20">
            <Badge variant="secondary" className="font-semibold px-2.5 py-0.5 shadow-sm border-transparent bg-background/90 backdrop-blur-sm text-xs">
              {product.badge}
            </Badge>
          </div>
        )}
        {discountPct !== null && (
          <div className="absolute top-3 right-3 z-20">
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-sm">
              {discountPct}% OFF
            </span>
          </div>
        )}
        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
          className={`absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
            wishlisted
              ? "bg-red-500 text-white scale-110"
              : "bg-background/90 backdrop-blur-sm text-muted-foreground hover:bg-red-50 hover:text-red-500"
          }`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
        </button>
      </CardHeader>

      <CardContent className="flex-1 p-5">
        <div className="space-y-1 mb-3">
          {product.storeName && (
            <p className="text-[11px] font-medium text-muted-foreground">{product.storeName}</p>
          )}
          <span className={`inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${categoryColor}`}>
            {product.category.replace(/-/g, " ")}
          </span>
          <h3 className="font-display font-semibold text-base leading-snug line-clamp-2 mt-1">
            <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors">
              {product.title}
            </Link>
          </h3>
        </div>

        <StarRating rating={product.rating} reviewCount={product.reviewCount} className="mb-3" />

        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-2xl font-bold tracking-tight">${product.price.toFixed(2)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 flex flex-col gap-2 z-20">
        <Button
          asChild
          className="w-full font-semibold group/btn"
          size="lg"
          onClick={() => trackAffiliateClick(product.id, product.title, product.slug)}
        >
          <a href={affiliateUrl} target="_blank" rel="noopener noreferrer">
            Get This Deal
            <ExternalLink className="w-4 h-4 ml-2 opacity-75" />
          </a>
        </Button>
        {!hideCompare && (
          <button
            onClick={() => toggleCompare(product)}
            disabled={!inCompare && atLimit}
            className={`w-full flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg transition-all border ${
              inCompare
                ? "bg-primary/10 text-primary border-primary/30"
                : atLimit
                  ? "text-muted-foreground/40 border-muted/40 cursor-not-allowed"
                  : "text-muted-foreground border-muted hover:border-primary/30 hover:text-primary hover:bg-primary/5"
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            {inCompare ? "Remove from compare" : atLimit ? "Compare limit reached" : "Add to compare"}
          </button>
        )}
      </CardFooter>
    </Card>
  );
}
