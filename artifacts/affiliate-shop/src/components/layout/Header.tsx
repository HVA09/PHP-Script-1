import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  Search, ShoppingBag, Menu, X, Laptop, Shirt, Home,
  Dumbbell, Sparkles, BookOpen, Heart, LayoutGrid, GitCompare,
  User, LogIn, LogOut, Globe2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useAuthContext } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";

function InstantSearchDropdown({
  query,
  onClose,
}: {
  query: string;
  onClose: () => void;
}) {
  const { data: allProducts } = useListProducts(
    {},
    { query: { queryKey: getListProductsQueryKey({}) } },
  );

  const results = useMemo(() => {
    if (!query || query.length < 2 || !allProducts) return [];
    const q = query.toLowerCase();
    return allProducts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [query, allProducts]);

  if (results.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-[100] bg-background border rounded-xl shadow-2xl mt-1.5 overflow-hidden">
      <div className="px-3 py-2 border-b">
        <p className="text-xs text-muted-foreground font-medium">
          {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
        </p>
      </div>
      {results.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors group"
        >
          <img
            src={product.imageUrl}
            alt={product.title}
            width={40}
            height={40}
            loading="lazy"
            decoding="async"
            className="w-10 h-10 rounded-lg object-cover shrink-0 border mix-blend-multiply"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
              {product.title}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {product.category.replace(/-/g, " ")} · ${product.price.toFixed(2)}
            </p>
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs font-bold text-green-600 shrink-0">
              {Math.round(100 - (product.price / product.originalPrice) * 100)}% OFF
            </span>
          )}
        </Link>
      ))}
      <Link
        href={`/products?search=${encodeURIComponent(query)}`}
        onClick={onClose}
        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-muted/40 hover:bg-muted transition-colors text-sm font-medium text-primary border-t"
      >
        <Search className="w-3.5 h-3.5" />
        View all results for "{query}"
      </Link>
    </div>
  );
}

export function Header() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { count: wishlistCount } = useWishlist();
  const { count: compareCount } = useCompare();
  const { user, isAuthenticated, isLoading: authLoading, login, logout } = useAuthContext();
  const { t, toggleLanguage, language } = useLanguage();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/products", label: t("nav.deals") },
    { href: "/categories", label: t("nav.categories"), icon: LayoutGrid },
    { href: "/blog", label: t("nav.blog") },
    { href: "/about", label: t("nav.about") },
  ];

  const categoryLinks = [
    { href: "/products?category=electronics", label: t("nav.electronics"), icon: Laptop },
    { href: "/products?category=fashion", label: t("nav.fashion"), icon: Shirt },
    { href: "/products?category=home-kitchen", label: t("nav.homeCategory"), icon: Home },
    { href: "/products?category=sports-outdoors", label: t("nav.sports"), icon: Dumbbell },
    { href: "/products?category=beauty-health", label: t("nav.beauty"), icon: Sparkles },
    { href: "/products?category=books", label: t("nav.books"), icon: BookOpen },
  ];

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "Account"
    : null;
  const initials = user
    ? [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "U"
    : null;

  return (
    <header className="sticky top-0 z-50 w-full shadow-sm">
      <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs font-medium tracking-wide">
              {t("header.shipping")} &nbsp;|&nbsp; {t("header.updated")}
      </div>
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo + Nav */}
          <div className="flex items-center gap-5 shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
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
          <nav className="hidden 2xl:flex items-center gap-0.5 border-l pl-4 shrink-0">
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

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Instant search (desktop) */}
            <div className="hidden md:block relative w-52" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("header.search")}
                  className="w-full pl-9 border-border bg-background focus-visible:ring-primary h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(e.target.value.length >= 2);
                  }}
                  onFocus={() => { if (searchQuery.length >= 2) setShowDropdown(true); }}
                  onKeyDown={(e) => { if (e.key === "Escape") setShowDropdown(false); }}
                />
              </form>
              {showDropdown && (
                <InstantSearchDropdown
                  query={searchQuery}
                  onClose={() => { setShowDropdown(false); setSearchQuery(""); }}
                />
              )}
            </div>

            {/* Compare badge */}
            {compareCount > 0 && (
              <Link
                href="/compare"
                className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors hidden md:flex items-center gap-1.5 text-xs font-semibold border"
              >
                <GitCompare className="w-4 h-4" />
                <span>{compareCount}</span>
              </Link>
            )}

            {/* Wishlist icon */}
            <Link href="/wishlist" className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Auth button */}
            {!authLoading && (
              isAuthenticated && user ? (
                <Link href="/profile">
                  <button className="hidden md:flex items-center gap-2 h-9 px-3 rounded-md border hover:border-primary/40 hover:bg-muted transition-all text-sm font-medium">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={displayName ?? ""}
                        className="w-6 h-6 rounded-full object-cover border border-primary/20"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                        {initials}
                      </div>
                    )}
                    <span className="max-w-[80px] truncate">{displayName}</span>
                  </button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={login}
                  className="hidden md:flex gap-1.5 h-9"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {t("header.login")}
                </Button>
              )
            )}

            <button
              type="button"
              onClick={toggleLanguage}
              className="hidden shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:flex"
              aria-label={language === "en" ? "Switch to Arabic" : "Switch to English"}
            >
              <Globe2 className="h-3.5 w-3.5" />
              {language === "en" ? "عربي" : "EN"}
            </button>

            {/* Mobile hamburger */}
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

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-background p-4 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                 placeholder={t("header.search")}
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
              {compareCount > 0 && (
                <Link
                  href="/compare"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <GitCompare className="w-4 h-4" />
                  Compare ({compareCount})
                </Link>
              )}
              <div className="my-1 border-t" />
              {/* Auth row in mobile */}
              {!authLoading && (
                isAuthenticated ? (
                  <div className="flex items-center gap-2 px-3 py-2">
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {initials}
                      </div>
                    )}
                    <Link href="/profile" className="flex-1 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                       {t("header.account")}
                    </Link>
                    <button onClick={() => { setIsMobileMenuOpen(false); logout(); }} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
                       <LogOut className="w-3.5 h-3.5" /> {t("header.logout")}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); login(); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-primary w-full text-left"
                  >
                    <LogIn className="w-4 h-4" />
                     {t("header.login")}
                  </button>
                )
              )}
              <div className="my-1 border-t" />
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-primary w-full text-left"
              >
                <Globe2 className="w-4 h-4" />
                {language === "en" ? "العربية" : "English"}
              </button>
              <div className="my-1 border-t" />
               <p className="px-3 py-1 text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("header.shopCategory")}</p>
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
              <div className="my-1 border-t" />
              <div className="flex gap-2 px-3">
                 <Link href="/about" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>{t("nav.about")}</Link>
                <span className="text-muted-foreground/40">·</span>
                 <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>{t("footer.contact")}</Link>
                <span className="text-muted-foreground/40">·</span>
                 <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>{t("footer.privacy")}</Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
