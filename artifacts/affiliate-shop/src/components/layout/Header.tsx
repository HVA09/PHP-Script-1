import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingBag, Menu, X, Laptop, Shirt, Home, Dumbbell, Sparkles, BookOpen, Heart, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/WishlistContext";

export function Header() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { count: wishlistCount } = useWishlist();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "All Deals" },
    { href: "/categories", label: "Categories", icon: LayoutGrid },
  ];

  const categoryLinks = [
    { href: "/products?category=electronics", label: "Electronics", icon: Laptop },
    { href: "/products?category=fashion", label: "Fashion", icon: Shirt },
    { href: "/products?category=home-kitchen", label: "Home", icon: Home },
    { href: "/products?category=sports-outdoors", label: "Sports", icon: Dumbbell },
    { href: "/products?category=beauty-health", label: "Beauty", icon: Sparkles },
    { href: "/products?category=books", label: "Books", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full shadow-sm">
      <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs font-medium tracking-wide">
        Free shipping on orders over $50 &nbsp;|&nbsp; Deals updated daily
      </div>
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md group-hover:rotate-12 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">DealHub</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  {link.icon && <link.icon className="w-3.5 h-3.5" />}
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Category quick-nav */}
          <nav className="hidden xl:flex items-center gap-0.5 border-l pl-4 ml-1">
            {categoryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-md"
              >
                <link.icon className="w-3 h-3" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            <div className="flex-1 w-48 hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search deals..."
                  className="w-full pl-9 border-border bg-background focus-visible:ring-primary h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            {/* Wishlist icon */}
            <Link href="/wishlist" className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-background p-4 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search deals..."
                className="w-full pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon && <link.icon className="w-4 h-4 text-primary" />}
                  {link.label}
                </Link>
              ))}
              <div className="my-1 border-t" />
              <p className="px-3 py-1 text-xs text-muted-foreground uppercase tracking-wider font-semibold">Shop by Category</p>
              {categoryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <link.icon className="w-4 h-4 text-primary" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
