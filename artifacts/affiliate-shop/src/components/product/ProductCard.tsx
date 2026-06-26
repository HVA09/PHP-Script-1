import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import type { Product } from "@workspace/api-client-react/src/generated/api.schemas";
import { ExternalLink } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group" data-testid={`card-product-${product.id}`}>
      <CardHeader className="p-0 relative aspect-square bg-muted">
        <Link href={`/products/${product.id}`} className="absolute inset-0 z-10" aria-label={`View ${product.title}`}>
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
            <Badge variant="secondary" className="font-semibold px-2.5 py-0.5 shadow-sm border-transparent bg-background/90 backdrop-blur-sm">
              {product.badge}
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 p-5">
        <div className="space-y-1 mb-3">
          <p className="text-xs font-medium text-primary uppercase tracking-wider">
            {product.category}
          </p>
          <h3 className="font-display font-semibold text-lg leading-tight line-clamp-2">
            <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors">
              {product.title}
            </Link>
          </h3>
        </div>
        
        <StarRating rating={product.rating} reviewCount={product.reviewCount} className="mb-4" />
        
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
            View Deal
            <ExternalLink className="w-4 h-4 ml-2 opacity-70 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
