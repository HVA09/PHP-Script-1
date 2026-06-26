import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden" data-testid="skeleton-product">
      <CardHeader className="p-0 aspect-square">
        <Skeleton className="w-full h-full rounded-none" />
      </CardHeader>
      <CardContent className="flex-1 p-5 space-y-4">
        <Skeleton className="h-3 w-1/3" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-1/3 pt-4 mt-auto" />
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Skeleton className="h-11 w-full" />
      </CardFooter>
    </Card>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
