import { useState } from "react";
import { Link } from "wouter";
import { ShoppingBag, Mail } from "lucide-react";
import { useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "All Deals" },
    { href: "/products?category=electronics", label: "Electronics" },
    { href: "/products?category=fashion", label: "Fashion" },
    { href: "/products?category=home-kitchen", label: "Home & Kitchen" },
  ];

  const topBrands = ["Apple", "Sony", "Nike", "Le Creuset", "Garmin", "Dyson"];

  return (
    <footer className="bg-accent text-accent-foreground mt-auto">
      <div className="container mx-auto px-4 py-14 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">DealHub</span>
            </Link>
            <p className="text-accent-foreground/70 text-sm leading-relaxed max-w-xs">
              Your curated source for the best products at the lowest prices. We scour the web so you never overpay again.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-5 text-accent-foreground">Top Categories</h4>
            <ul className="space-y-2.5 text-sm">
              {categories?.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="text-accent-foreground/70 hover:text-primary transition-colors"
                  >
                    {category.name}
                    <span className="ml-1.5 text-xs opacity-50">({category.productCount})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-5 text-accent-foreground">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-accent-foreground/70 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-1 border-t border-accent-foreground/10">
                <p className="text-xs text-accent-foreground/50 font-semibold uppercase tracking-wider mb-2">Top Brands</p>
                <div className="flex flex-wrap gap-1.5">
                  {topBrands.map((brand) => (
                    <span key={brand} className="text-xs bg-accent-foreground/10 text-accent-foreground/70 px-2 py-0.5 rounded-full">
                      {brand}
                    </span>
                  ))}
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-5 text-accent-foreground">Stay Updated</h4>
            <p className="text-sm text-accent-foreground/70 mb-4 leading-relaxed">
              Get the best deals delivered to your inbox. No spam, ever.
            </p>
            {subscribed ? (
              <div className="bg-primary/20 text-primary border border-primary/30 rounded-lg p-4 text-sm font-medium">
                You're subscribed! Check your inbox for the best deals.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent-foreground/40" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    className="pl-9 bg-accent-foreground/10 border-accent-foreground/20 text-accent-foreground placeholder:text-accent-foreground/40 focus-visible:ring-primary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full font-semibold">
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-accent-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-accent-foreground/50 text-center md:text-left">
            &copy; {new Date().getFullYear()} DealHub. All rights reserved.
          </p>
          <p className="text-xs text-accent-foreground/40 text-center max-w-xl leading-relaxed">
            Affiliate Disclosure: DealHub is reader-supported. When you buy through links on our site, we may earn an affiliate commission at no extra cost to you.
          </p>
        </div>
      </div>
    </footer>
  );
}
