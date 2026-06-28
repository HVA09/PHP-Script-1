import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import type { Product } from "@workspace/api-client-react";
import { ArrowRight } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const categoryColors: Record<string, string> = {
  electronics: "bg-blue-100 text-blue-700",
  fashion: "bg-pink-100 text-pink-700",
  "home-kitchen": "bg-green-100 text-green-700",
  "sports-outdoors": "bg-orange-100 text-orange-700",
  "beauty-health": "bg-purple-100 text-purple-700",
  books: "bg-amber-100 text-amber-700",
};

export function ProductCard({ product }: ProductCardProps) {
  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(100 - (product.price / product.originalPrice) * 100)
      : null;

  const categoryColor = categoryColors[product.category] ?? "bg-primary/10 text-primary";

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
      </CardHeader>

      <CardContent className="flex-1 p-5">
        <div className="space-y-1 mb-3">
          <span className={`inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${categoryColor}`}>
            {product.category.replace("-", " ")}
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

      <CardFooter className="p-5 pt-0 z-20">
        <Button asChild className="w-full font-semibold group/btn" size="lg">
          <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer">
            Get This Deal
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
