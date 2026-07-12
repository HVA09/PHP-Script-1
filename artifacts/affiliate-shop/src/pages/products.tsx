import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { Search as SearchIcon, Filter, X, Star, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";
import { useSEO } from "@/hooks/useSEO";
import { extractBrand, ALL_BRANDS } from "@/lib/extractBrand";
import {
  useListProducts,
  getListProductsQueryKey,
  useListCategories,
  getListCategoriesQueryKey,
} from "@workspace/api-client-react";

const PAGE_SIZE = 12;

function StarFilterButton({ value, selected, onClick }: { value: number; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all w-full ${
        selected ? "bg-primary/10 border-primary/30 text-primary font-semibold" : "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      {Array.from({ length: value }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
      ))}
      <span>& up</span>
    </button>
  );
}

function PaginationBar({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const maxVisible = 7;
  let visible = pages;
  if (total > maxVisible) {
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, page - half);
    const end = Math.min(total, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    visible = pages.slice(start - 1, end);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10 flex-wrap">
      <Button variant="outline" size="sm" onClick={() => onChange(page - 1)} disabled={page === 1} className="h-9 w-9 p-0">
        <ChevronLeft className="w-4 h-4" />
      </Button>
      {visible[0] > 1 && (
        <>
          <Button variant="outline" size="sm" onClick={() => onChange(1)} className="h-9 w-9 p-0">1</Button>
          {visible[0] > 2 && <span className="text-muted-foreground text-sm px-1">…</span>}
        </>
      )}
      {visible.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(p)}
          className="h-9 w-9 p-0"
        >
          {p}
        </Button>
      ))}
      {visible[visible.length - 1] < total && (
        <>
          {visible[visible.length - 1] < total - 1 && <span className="text-muted-foreground text-sm px-1">…</span>}
          <Button variant="outline" size="sm" onClick={() => onChange(total)} className="h-9 w-9 p-0">{total}</Button>
        </>
      )}
      <Button variant="outline" size="sm" onClick={() => onChange(page + 1)} disabled={page === total} className="h-9 w-9 p-0">
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function Products() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const topRef = useRef<HTMLDivElement>(null);

  const searchParams = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const querySearch = searchParams.get("search") || "";
  const queryCategory = searchParams.get("category") || "";
  const queryFeatured = searchParams.get("featured") === "true";
  const querySort = searchParams.get("sort") || "featured";
  const queryBrand = searchParams.get("brand") || "";
  const queryMinPrice = Number(searchParams.get("minPrice") || 0);
  const queryMaxPrice = Number(searchParams.get("maxPrice") || 9999);
  const queryMinRating = Number(searchParams.get("minRating") || 0);
  const queryPage = Math.max(1, Number(searchParams.get("page") || 1));

  const [searchInput, setSearchInput] = useState(querySearch);
  const [priceRange, setPriceRange] = useState<[number, number]>([queryMinPrice, queryMaxPrice === 9999 ? 1000 : queryMaxPrice]);

  useSEO({
    title: "All Deals",
    description: "Browse 22+ hand-curated products across electronics, fashion, home & kitchen, sports, beauty, and books. Best prices guaranteed.",
    keywords: "best deals, affiliate products, electronics deals, fashion deals, home kitchen deals",
  });

  useEffect(() => { setSearchInput(querySearch); }, [querySearch]);

  const { data: categories, isLoading: loadingCategories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });

  const { data: products, isLoading: loadingProducts } = useListProducts(
    {
      search: querySearch || undefined,
      category: queryCategory || undefined,
      featured: queryFeatured || undefined,
    },
    {
      query: {
        queryKey: getListProductsQueryKey({
          search: querySearch || undefined,
          category: queryCategory || undefined,
          featured: queryFeatured || undefined,
        }),
      },
    },
  );

  // Compute price bounds from all products
  const priceBounds = useMemo(() => {
    if (!products || products.length === 0) return [0, 1000] as [number, number];
    const prices = products.map((p) => p.price);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))] as [number, number];
  }, [products]);

  // Client-side filters: brand, price, rating
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      if (queryBrand && extractBrand(p.title) !== queryBrand) return false;
      if (p.price < queryMinPrice) return false;
      if (queryMaxPrice < 9999 && p.price > queryMaxPrice) return false;
      if (queryMinRating > 0 && (p.rating ?? 0) < queryMinRating) return false;
      return true;
    });
  }, [products, queryBrand, queryMinPrice, queryMaxPrice, queryMinRating]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (querySort) {
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "rating": return (b.rating ?? 0) - (a.rating ?? 0);
        case "newest": return b.id - a.id;
        case "discount": {
          const dA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const dB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return dB - dA;
        }
        default:
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
      }
    });
  }, [filteredProducts, querySort]);

  const totalPages = Math.ceil(sortedProducts.length / PAGE_SIZE);
  const paginatedProducts = sortedProducts.slice((queryPage - 1) * PAGE_SIZE, queryPage * PAGE_SIZE);

  const updateUrl = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) newParams.delete(key);
      else newParams.set(key, value);
    });
    if (!updates.page) newParams.set("page", "1");
    const qs = newParams.toString();
    setLocation(qs ? `/products?${qs}` : "/products");
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePageChange = (p: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", String(p));
    setLocation(`/products?${newParams.toString()}`);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: searchInput || null, page: "1" });
  };

  const applyPriceFilter = () => {
    updateUrl({
      minPrice: priceRange[0] > priceBounds[0] ? String(priceRange[0]) : null,
      maxPrice: priceRange[1] < priceBounds[1] ? String(priceRange[1]) : null,
    });
  };

  // Active filter count
  const activeFilterCount =
    (querySearch ? 1 : 0) +
    (queryCategory ? 1 : 0) +
    (queryFeatured ? 1 : 0) +
    (queryBrand ? 1 : 0) +
    (queryMinPrice > 0 ? 1 : 0) +
    (queryMaxPrice < 9999 ? 1 : 0) +
    (queryMinRating > 0 ? 1 : 0);

  // Extract available brands from current products
  const availableBrands = useMemo(() => {
    if (!products) return ALL_BRANDS;
    const set = new Set(products.map((p) => extractBrand(p.title)));
    return ALL_BRANDS.filter((b) => set.has(b));
  }, [products]);

  const FilterSidebar = () => (
    <div className="space-y-7">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Categories
        </h3>
        {loadingCategories ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-6 w-3/4 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <ul className="space-y-0.5">
            <li>
              <button
                onClick={() => updateUrl({ category: null })}
                className={`text-sm text-left w-full px-2 py-1.5 rounded-md transition-colors ${
                  !queryCategory ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-muted-foreground"
                }`}
              >
                All Categories
              </button>
            </li>
            {categories?.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => updateUrl({ category: cat.slug })}
                  className={`text-sm text-left w-full px-2 py-1.5 rounded-md transition-colors flex justify-between items-center ${
                    queryCategory === cat.slug ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-sm">{cat.productCount}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">Price Range</h3>
        <div className="px-1">
          <Slider
            min={priceBounds[0]}
            max={priceBounds[1]}
            step={5}
            value={[priceRange[0], priceRange[1] > priceBounds[1] ? priceBounds[1] : priceRange[1]]}
            onValueChange={(v) => setPriceRange([v[0], v[1]])}
            className="mb-4"
          />
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Min</label>
              <Input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="h-8 text-sm"
                min={priceBounds[0]}
                max={priceRange[1]}
              />
            </div>
            <span className="text-muted-foreground text-sm mt-4">—</span>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Max</label>
              <Input
                type="number"
                value={priceRange[1] > priceBounds[1] ? priceBounds[1] : priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="h-8 text-sm"
                min={priceRange[0]}
                max={priceBounds[1]}
              />
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full mt-3 h-8 text-xs" onClick={applyPriceFilter}>
            Apply Price Filter
          </Button>
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <h3 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">Min Rating</h3>
        <div className="space-y-0.5">
          {[4, 3, 2, 1].map((r) => (
            <StarFilterButton
              key={r}
              value={r}
              selected={queryMinRating === r}
              onClick={() => updateUrl({ minRating: queryMinRating === r ? null : String(r) })}
            />
          ))}
          {queryMinRating > 0 && (
            <button onClick={() => updateUrl({ minRating: null })} className="text-xs text-muted-foreground hover:text-foreground mt-1 px-2">
              Clear rating filter
            </button>
          )}
        </div>
      </div>

      {/* Brand */}
      <div>
        <h3 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">Brand</h3>
        <div className="space-y-0.5 max-h-52 overflow-y-auto">
          {availableBrands.map((brand) => (
            <button
              key={brand}
              onClick={() => updateUrl({ brand: queryBrand === brand ? null : brand })}
              className={`text-sm text-left w-full px-2 py-1.5 rounded-md transition-colors ${
                queryBrand === brand ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      <div>
        <h3 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">Status</h3>
        <button
          onClick={() => updateUrl({ featured: queryFeatured ? null : "true" })}
          className={`text-sm text-left w-full px-2 py-1.5 rounded-md transition-colors flex items-center gap-2 ${
            queryFeatured ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-muted-foreground"
          }`}
        >
          <div className={`w-4 h-4 border rounded-sm flex items-center justify-center shrink-0 ${queryFeatured ? "bg-primary border-primary" : "border-muted-foreground"}`}>
            {queryFeatured && <div className="w-2 h-2 bg-primary-foreground rounded-sm" />}
          </div>
          Featured Deals Only
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col" ref={topRef}>
      {/* Hero */}
      <div className="bg-accent text-accent-foreground py-12 px-4">
        <div className="container mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-2">All Deals</h1>
          <p className="text-accent-foreground/70 mb-6 text-sm">
            {!loadingProducts && products ? `${sortedProducts.length} product${sortedProducts.length !== 1 ? "s" : ""} found` : "Discover the best products at the best prices"}
          </p>
          <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products, brands, categories..."
              className="w-full pl-11 h-12 text-base bg-background text-foreground border-2 border-transparent focus-visible:ring-0 focus-visible:border-primary rounded-xl"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 font-semibold">
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 items-center mb-6">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {querySearch && (
              <Badge className="gap-1 px-2.5 py-1 bg-primary text-primary-foreground border-transparent">
                "{querySearch}" <button onClick={() => updateUrl({ search: null })} className="hover:opacity-70"><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {queryCategory && (
              <Badge className="gap-1 px-2.5 py-1 bg-primary text-primary-foreground border-transparent">
                {categories?.find((c) => c.slug === queryCategory)?.name ?? queryCategory}
                <button onClick={() => updateUrl({ category: null })} className="hover:opacity-70"><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {queryFeatured && (
              <Badge className="gap-1 px-2.5 py-1 bg-primary text-primary-foreground border-transparent">
                Featured <button onClick={() => updateUrl({ featured: null })} className="hover:opacity-70"><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {queryBrand && (
              <Badge className="gap-1 px-2.5 py-1 bg-primary text-primary-foreground border-transparent">
                Brand: {queryBrand} <button onClick={() => updateUrl({ brand: null })} className="hover:opacity-70"><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {(queryMinPrice > 0 || queryMaxPrice < 9999) && (
              <Badge className="gap-1 px-2.5 py-1 bg-primary text-primary-foreground border-transparent">
                ${queryMinPrice}–${queryMaxPrice < 9999 ? `$${queryMaxPrice}` : "∞"}
                <button onClick={() => updateUrl({ minPrice: null, maxPrice: null })} className="hover:opacity-70"><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {queryMinRating > 0 && (
              <Badge className="gap-1 px-2.5 py-1 bg-primary text-primary-foreground border-transparent">
                {queryMinRating}★ & up <button onClick={() => updateUrl({ minRating: null })} className="hover:opacity-70"><X className="w-3 h-3" /></button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => setLocation("/products")} className="h-6 px-2 text-xs text-muted-foreground">
              Clear all
            </Button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-28 border rounded-2xl p-5 bg-card shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold flex items-center gap-1.5 text-sm">
                <Filter className="w-4 h-4" /> Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">{activeFilterCount}</span>
                )}
              </h2>
              {activeFilterCount > 0 && (
                <button onClick={() => setLocation("/products")} className="text-xs text-muted-foreground hover:text-foreground">
                  Reset all
                </button>
              )}
            </div>
            <FilterSidebar />
          </aside>

          {/* Main Content */}
          <div className="flex-1 w-full min-w-0">
            {/* Controls Bar */}
            <div className="bg-card border p-3 rounded-xl mb-5 flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden shrink-0">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">{activeFilterCount}</span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] overflow-y-auto">
                    <SheetHeader className="mb-6 border-b pb-4">
                      <SheetTitle>Filter Products</SheetTitle>
                    </SheetHeader>
                    <FilterSidebar />
                  </SheetContent>
                </Sheet>
                <p className="text-sm text-muted-foreground">
                  {loadingProducts ? "Loading..." : `${sortedProducts.length} product${sortedProducts.length !== 1 ? "s" : ""}`}
                  {totalPages > 1 && ` · Page ${queryPage} of ${totalPages}`}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto self-end">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Sort:</span>
                <Select value={querySort} onValueChange={(val) => updateUrl({ sort: val })}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-background">
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured First</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="discount">Biggest Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grid */}
            {loadingProducts ? (
              <ProductGridSkeleton count={12} />
            ) : paginatedProducts.length === 0 ? (
              <div className="bg-card border border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center py-24">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <SearchIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold mb-2">No products found</h2>
                <p className="text-muted-foreground max-w-md mb-6 text-sm">
                  We couldn't find anything matching your current filters. Try adjusting or clearing them.
                </p>
                <Button onClick={() => setLocation("/products")}>Clear all filters</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <PaginationBar page={queryPage} total={totalPages} onChange={handlePageChange} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
