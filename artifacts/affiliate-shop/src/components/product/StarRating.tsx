import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number | null | undefined;
  reviewCount?: number | null;
  className?: string;
}

export function StarRating({ rating, reviewCount, className }: StarRatingProps) {
  if (rating === null || rating === undefined) {
    return null;
  }

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-1.5", className)} data-testid="star-rating">
      <div className="flex text-amber-500">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-current" />
        ))}
        {hasHalfStar && <StarHalf className="w-4 h-4 fill-current" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-muted-foreground/30" />
        ))}
      </div>
      {reviewCount !== undefined && reviewCount !== null && (
        <span className="text-xs text-muted-foreground tabular-nums">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
