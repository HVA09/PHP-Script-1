import { Link } from "wouter";
import { ChevronRight, Star, ExternalLink, GitCompare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCompare } from "@/context/CompareContext";
import { useSEO } from "@/hooks/useSEO";
import { buildAffiliateUrl, trackAffiliateClick } from "@/lib/affiliateTracking";
import type { Product } from "@workspace/api-client-react";

function Stars({ rating }: { rating: number | null | undefined }) {
  const r = rating ?? 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(r) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"}`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{r.toFixed(1)}</span>
    </div>
  );
}

const SPEC_ROWS: { label: string; key: keyof Product | "discount" }[] = [
  { label: "Price", key: "price" },
  { label: "Original Price", key: "originalPrice" },
  { label: "Discount", key: "discount" },
  { label: "Rating", key: "rating" },
  { label: "Review Count", key: "reviewCount" },
  { label: "Category", key: "category" },
  { label: "Badge", key: "badge" },
];

export default function Compare() {
  useSEO({ title: "Compare Products", description: "Compare products side-by-side on DealHub." });

  const { compareList, count, toggleCompare, clearCompare } = useCompare();

  if (count === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-lg">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <GitCompare className="w-10 h-10 text-muted-foreground opacity-40" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Nothing to compare</h1>
        <p className="text-muted-foreground mb-8">
          Go to <Link href="/products" className="text-primary underline">All Deals</Link> and click the compare button on any 2–3 products.
        </p>
        <Button asChild><Link href="/products">Browse Products</Link></Button>
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-8">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/products" className="hover:text-foreground">All Deals</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Compare</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-7xl overflow-x-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Product Comparison</h1>
            <p className="text-muted-foreground text-sm mt-1">Comparing {count} product{count !== 1 ? "s" : ""} side-by-side</p>
          </div>
          <Button variant="outline" size="sm" onClick={clearCompare} className="gap-2">
            <X className="w-4 h-4" /> Clear All
          </Button>
        </div>

        {/* Header row */}
        <div className={`grid gap-4 mb-6`} style={{ gridTemplateColumns: `200px repeat(${count}, 1fr)` }}>
          <div />
          {compareList.map((product) => (
            <div key={product.id} className="relative bg-card border rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleCompare(product)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-background/80 shadow flex items-center justify-center hover:bg-background transition-colors z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="aspect-square relative bg-muted">
                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover mix-blend-multiply" />
              </div>
              <div className="p-4">
                <Badge variant="outline" className="text-[10px] mb-2 capitalize">{product.category.replace(/-/g, " ")}</Badge>
                <h3 className="font-semibold text-sm leading-snug line-clamp-3 mb-3">{product.title}</h3>
                <Stars rating={product.rating} />
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <Button
                  asChild
                  size="sm"
                  className="w-full mt-4 font-semibold"
                  onClick={() => trackAffiliateClick(product.id, product.title, product.slug)}
                >
                  <a href={buildAffiliateUrl(product.affiliateUrl, product.slug)} target="_blank" rel="noopener noreferrer">
                    Buy Now <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Spec rows */}
        <div className="border rounded-2xl overflow-hidden">
          {SPEC_ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`grid gap-4 ${i % 2 === 0 ? "bg-muted/40" : "bg-card"}`}
              style={{ gridTemplateColumns: `200px repeat(${count}, 1fr)` }}
            >
              <div className="px-4 py-3 text-sm font-semibold text-muted-foreground border-r flex items-center">
                {row.label}
              </div>
              {compareList.map((product) => {
                let value: React.ReactNode = "—";
                if (row.key === "price") value = <span className="font-bold text-foreground">${product.price.toFixed(2)}</span>;
                else if (row.key === "originalPrice") value = product.originalPrice ? `$${product.originalPrice.toFixed(2)}` : "—";
                else if (row.key === "discount") {
                  if (product.originalPrice && product.originalPrice > product.price) {
                    const pct = Math.round(100 - (product.price / product.originalPrice) * 100);
                    value = <span className="text-green-600 font-bold">{pct}% OFF</span>;
                  }
                } else if (row.key === "rating") value = <Stars rating={product.rating} />;
                else if (row.key === "reviewCount") value = product.reviewCount ? `${product.reviewCount.toLocaleString()} reviews` : "—";
                else if (row.key === "category") value = <span className="capitalize">{(product.category as string).replace(/-/g, " ")}</span>;
                else if (row.key === "badge") value = product.badge ?? "—";
                return (
                  <div key={product.id} className="px-4 py-3 text-sm text-muted-foreground flex items-center">
                    {value}
                  </div>
                );
              })}
            </div>
          ))}

        </div>

        <div className="mt-8 text-center">
          <Link href="/products" className="text-sm text-primary hover:underline">
            ← Back to all products
          </Link>
        </div>
      </div>
    </div>
  );
}
