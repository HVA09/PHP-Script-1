import { useEffect } from "react";
import { Link } from "wouter";
import { Heart, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";

export default function Wishlist() {
  const { wishlist } = useWishlist();

  const { data: allProducts } = useListProducts(
    {},
    { query: { queryKey: getListProductsQueryKey({}) } }
  );

  useEffect(() => {
    document.title = "My Wishlist | DealHub";
  }, []);

  const wishlisted = allProducts?.filter((p) => wishlist.has(p.id)) ?? [];

  return (
    <div className="pb-20">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">My Wishlist</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground text-sm">
              {wishlisted.length > 0 ? `${wishlisted.length} saved deal${wishlisted.length !== 1 ? "s" : ""}` : "No saved items yet"}
            </p>
          </div>
        </div>

        {wishlisted.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-muted-foreground opacity-40" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Browse our curated deals and tap the heart icon on any product to save it for later.
            </p>
            <Button asChild size="lg">
              <Link href="/products">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Browse All Deals
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlisted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
