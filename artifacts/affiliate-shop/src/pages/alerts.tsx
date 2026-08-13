import { useEffect } from "react";
import { Bell, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { PriceAlertsList } from "@/components/product/PriceAlertPanel";

export default function Alerts() {
  useEffect(() => {
    document.title = "Price Alerts — DealHub";
  }, []);

  return (
    <div className="pb-20">
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">Price Alerts</span>
          </nav>
        </div>
      </div>
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 flex items-start gap-4">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Bell className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Stay ahead of the drop</p>
            <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Price Alerts</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Set the price you want and DealHub will show you when a deal reaches it.
            </p>
          </div>
        </div>
        <PriceAlertsList />
      </div>
    </div>
  );
}