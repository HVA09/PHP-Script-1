import { useEffect, useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { Search as SearchIcon, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  useListProducts,
  getListProductsQuSamsung 65eryKey,
  useListCategories,
  getListCategoriesQueryKey,
} from "@workspace/api-client-react";

export default function Products() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();

  const searchParams = useMemo(
    () => new URLSearchParams(searchString),
    [searchString],
  );
  const querySearch = searchParams.get("search") || "";
  const queryCategory = searchParams.get("category") || "";
  const queryFeatured = searchParams.get("featured") === "true";
  const querySort = searchParams.get("sort") || "featured";

  const [searchInput, setSearchInput] = useState(querySearch);

  useEffect(() => {
    document.title = "All Deals | DealHub";
  }, []);

  useEffect(() => {
    setSearchInput(querySearch);
  }, [querySearch]);

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

  const sortedProducts = useMemo(() => {
    if (!products) return [];
    return [...products].sort((a, b) => {
      switch (querySort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
      }
    });
  }, [products, querySort]);

  const updateUrl = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) newParams.delete(key);
      else newParams.set(key, value);
    });
    const newSearchString = newParams.toString();
    setLocation(newSearchString ? `/products?${newSearchString}` : "/products");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: searchInput || null });
  };

  const activeFilterCount =
    (querySearch ? 1 : 0) + (queryCategory ? 1 : 0) + (queryFeatured ? 1 : 0);

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold mb-4 text-xs uppercase tracking-wider text-muted-foreground">
          Categories
        </h3>
        {loadingCategories ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-6 w-3/4 bg-muted rounded animate-pulse"
              />
            ))}
          </div>
        ) : (
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => updateUrl({ category: null })}
                className={`text-sm text-left w-full px-2 py-1.5 rounded-md transition-colors ${
                  !queryCategory
                    ? "bg-primary/10 text-primary font-semibold"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
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
                    queryCategory === cat.slug
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-sm">
                    {cat.productCount}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-xs uppercase tracking-wider text-muted-foreground">
          Status
        </h3>
        <button
          onClick={() => updateUrl({ featured: queryFeatured ? null : "true" })}
          className={`text-sm text-left w-full px-2 py-1.5 rounded-md transition-colors flex items-center gap-2 ${
            queryFeatured
              ? "bg-primary/10 text-primary font-semibold"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <div
            className={`w-4 h-4 border rounded-sm flex items-center justify-center shrink-0 ${queryFeatured ? "bg-primary border-primary" : "border-muted-foreground"}`}
          >
            {queryFeatured && (
              <div className="w-2 h-2 bg-primary-foreground rounded-sm" />
            )}
          </div>
          Featured Deals Only
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      {/* Page Hero Strip */}
      <div className="bg-accent text-accent-foreground py-12 px-4">
        <div className="container mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-2">
            All Deals
          </h1>
          <p className="text-accent-foreground/70 mb-6 text-sm">
            {products && !loadingProducts
              ? `${products.length} products available`
              : "Discover the best products"}
          </p>
          <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search all products..."
              className="w-full pl-11 h-12 text-base bg-background text-foreground border-2 border-transparent focus-visible:ring-0 focus-visible:border-primary rounded-xl"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 font-semibold"
            >
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 items-center mb-6">
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            {querySearch && (
              <Badge className="gap-1 px-2.5 py-1 bg-primary text-primary-foreground border-transparent">
                Search: {querySearch}
                <button
                  onClick={() => updateUrl({ search: null })}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {queryCategory && (
              <Badge className="gap-1 px-2.5 py-1 bg-primary text-primary-foreground border-transparent">
                {categories?.find((c) => c.slug === queryCategory)?.name ||
                  queryCategory}
                <button
                  onClick={() => updateUrl({ category: null })}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {queryFeatured && (
              <Badge className="gap-1 px-2.5 py-1 bg-primary text-primary-foreground border-transparent">
                Featured
                <button
                  onClick={() => updateUrl({ featured: null })}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/products")}
              className="h-6 px-2 text-xs text-muted-foreground"
            >
              Clear all
            </Button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-60 shrink-0 sticky top-28 border rounded-xl p-5 bg-card">
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
                        <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px]">
                    <SheetHeader className="mb-6 border-b pb-4">
                      <SheetTitle>Filter Products</SheetTitle>
                    </SheetHeader>
                    <FilterSidebar />
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-muted-foreground">
                  {loadingProducts
                    ? "Loading..."
                    : `Showing ${sortedProducts.length} result${sortedProducts.length !== 1 ? "s" : ""}`}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto self-end">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Sort:
                </span>
                <Select
                  value={querySort}
                  onValueChange={(val) => updateUrl({ sort: val })}
                >
                  <SelectTrigger className="w-full sm:w-[160px] bg-background">
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured First</SelectItem>
                    <SelectItem value="price-asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-desc">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grid */}
            {loadingProducts ? (
              <ProductGridSkeleton count={12} />
            ) : sortedProducts.length === 0 ? (
              <div className="bg-card border border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center py-24">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <SearchIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold mb-2">No products found</h2>
                <p className="text-muted-foreground max-w-md mb-6 text-sm">
                  We couldn't find any products matching your current filters.
                  Try adjusting your search or category.
                </p>
                <Button onClick={() => setLocation("/products")}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
