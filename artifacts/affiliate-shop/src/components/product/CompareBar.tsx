import { Link } from "wouter";
import { X, GitCompare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/context/CompareContext";

export function CompareBar() {
  const { compareList, count, removeFromCompare, clearCompare } = useCompare();

  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t shadow-2xl">
      <div className="container mx-auto px-4 py-3 flex items-center gap-3 flex-wrap md:flex-nowrap">
        <div className="flex items-center gap-2 shrink-0">
          <GitCompare className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Compare ({count}/3)</span>
        </div>

        <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide">
          {compareList.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-2 bg-muted/60 border rounded-lg px-3 py-1.5 shrink-0"
            >
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-8 h-8 rounded object-cover mix-blend-multiply"
              />
              <span className="text-xs font-medium max-w-[100px] truncate">{product.title}</span>
              <button
                onClick={() => removeFromCompare(product.id)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`Remove ${product.title} from comparison`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {count < 3 &&
            Array.from({ length: 3 - count }).map((_, i) => (
              <div
                key={`empty-slot-${i}`}
                className="flex items-center justify-center w-24 h-9 border-2 border-dashed border-muted-foreground/30 rounded-lg text-xs text-muted-foreground shrink-0"
              >
                + Add
              </div>
            ))}
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <Button variant="ghost" size="sm" onClick={clearCompare} className="text-muted-foreground h-8 text-xs">
            Clear
          </Button>
          {count >= 2 && (
            <Button asChild size="sm" className="h-8 font-semibold">
              <Link href="/compare">
                Compare Now
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
