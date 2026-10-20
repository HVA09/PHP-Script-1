import { useEffect } from "react";
import { Link } from "wouter";
import {
  User,
  Heart,
  Clock,
  ChevronRight,
  LogIn,
  LogOut,
  Mail,
  ShoppingBag,
  Package,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product/ProductCard";
import { PriceAlertsList } from "@/components/product/PriceAlertPanel";
import { useAuthContext } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";

function ProductGrid({ ids, emptyMessage }: { ids: number[]; emptyMessage: string }) {
  const { data: allProducts } = useListProducts(
    {},
    { query: { queryKey: getListProductsQueryKey({}) } },
  );

  if (!allProducts) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  const products = ids
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean) as typeof allProducts;

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function Profile() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuthContext();
  const { wishlist } = useWishlist();
  const { recentIds } = useRecentlyViewed();

  useEffect(() => {
    document.title = isAuthenticated
      ? `${user?.firstName ?? "Account"} — DealHub`
      : "My Account — DealHub";
  }, [user, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-3">My Account</h1>
          <p className="text-muted-foreground mb-8">
            Log in to sync your wishlist across devices, see your recently viewed
            products, and manage your account.
          </p>
          <Button size="lg" onClick={login} className="gap-2">
            <LogIn className="w-4 h-4" /> Log In
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            No account yet? You can create one for free.
          </p>
        </div>
      </div>
    );
  }

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "U";

  return (
    <div className="pb-20">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">My Account</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* User card */}
          <div className="bg-card border rounded-2xl p-6 flex items-start gap-5">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={displayName}
                className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-primary/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl font-bold">{displayName}</h1>
              {user?.email && (
                <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-sm">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="font-semibold">{wishlist.size}</span>
                  <span className="text-muted-foreground">saved</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{recentIds.length}</span>
                  <span className="text-muted-foreground">viewed</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="shrink-0 gap-1.5">
              <LogOut className="w-3.5 h-3.5" /> Log out
            </Button>
          </div>

          {/* Wishlist */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                My Wishlist
                {wishlist.size > 0 && (
                  <Badge variant="secondary">{wishlist.size}</Badge>
                )}
              </h2>
              {wishlist.size > 0 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/wishlist">
                    View all <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
            <ProductGrid
              ids={[...wishlist].slice(0, 8)}
              emptyMessage="Save products you love and they'll appear here."
            />
          </section>

          {/* Recently viewed */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recently Viewed
                {recentIds.length > 0 && (
                  <Badge variant="secondary">{recentIds.length}</Badge>
                )}
              </h2>
            </div>
            <ProductGrid
              ids={recentIds.slice(0, 8)}
              emptyMessage="Products you've viewed will appear here."
            />
          </section>

          {/* Price alerts */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                <Bell className="h-5 w-5 text-primary" />
                Price Alerts
              </h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/alerts">Manage all <ChevronRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <PriceAlertsList />
          </section>

          {/* Quick links */}
          <section className={`grid grid-cols-1 gap-4 ${user?.isAdmin ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
            {[
              { href: "/products", icon: Package, label: "Browse All Deals", sub: "Find today's best deals" },
              { href: "/wishlist", icon: Heart, label: "Full Wishlist", sub: "All your saved products" },
              { href: "/alerts", icon: Bell, label: "Price Alerts", sub: "Track target prices" },
              ...(user?.isAdmin ? [{ href: "/admin", icon: ShieldCheck, label: "Admin Workspace", sub: "Manage the DealHub catalog" }] : []),
            ].map(({ href, icon: Icon, label, sub }) => (
              <Link key={href} href={href}>
                <div className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-primary/40 hover:bg-muted/40 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
