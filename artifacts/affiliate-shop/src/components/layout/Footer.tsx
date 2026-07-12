import { useState } from "react";
import { Link } from "wouter";
import { ShoppingBag, Mail, Twitter, Instagram, Facebook, Youtube, MapPin, Phone, Shield, Truck, RefreshCw, Star } from "lucide-react";
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
    if (email.trim()) { setSubscribed(true); setEmail(""); }
  };

  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "All Deals" },
    { href: "/categories", label: "All Categories" },
    { href: "/products?featured=true", label: "Featured Picks" },
    { href: "/wishlist", label: "My Wishlist" },
    { href: "/compare", label: "Compare Products" },
  ];

  const companyLinks = [
    { href: "/about", label: "About DealHub" },
    { href: "/contact", label: "Contact Us" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms & Conditions" },
  ];

  const topBrands = ["Apple", "Sony", "Nike", "Samsung", "Dyson", "Garmin", "Logitech", "Le Creuset"];

  const trustBadges = [
    { icon: Shield, label: "Secure Links", desc: "All affiliate links verified" },
    { icon: Star, label: "Curated Only", desc: "Editor-approved products" },
    { icon: Truck, label: "Best Prices", desc: "Competitive deals daily" },
    { icon: RefreshCw, label: "Updated Daily", desc: "Fresh deals every day" },
  ];

  const socials = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-accent text-accent-foreground mt-auto">
      {/* Trust bar */}
      <div className="border-b border-accent-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-accent-foreground/60">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="container mx-auto px-4 py-14 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">DealHub</span>
            </Link>
            <p className="text-accent-foreground/70 text-sm leading-relaxed max-w-xs">
              Your trusted global source for the best products at the lowest prices. We scour hundreds of retailers so you never overpay.
            </p>
            <div className="space-y-2 text-sm text-accent-foreground/60">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /><span>San Francisco, CA — Global</span></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /><span>hello@dealhub.com</span></div>
            </div>
            <div className="flex items-center gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label} className="w-9 h-9 rounded-full bg-accent-foreground/10 text-accent-foreground/60 hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display font-semibold mb-5 text-accent-foreground">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              {categories?.map((category) => (
                <li key={category.id}>
                  <Link href={`/products?category=${category.slug}`} className="text-accent-foreground/70 hover:text-primary transition-colors flex items-center justify-between group">
                    <span>{category.name}</span>
                    <span className="text-xs bg-accent-foreground/10 px-1.5 py-0.5 rounded group-hover:bg-primary/20 group-hover:text-primary transition-all">{category.productCount}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links + Company */}
          <div>
            <h4 className="font-display font-semibold mb-5 text-accent-foreground">Shop</h4>
            <ul className="space-y-2.5 text-sm mb-8">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-accent-foreground/70 hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
            <h4 className="font-display font-semibold mb-4 text-accent-foreground">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-accent-foreground/70 hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-semibold mb-5 text-accent-foreground">Get Deals First</h4>
            <p className="text-sm text-accent-foreground/70 mb-4 leading-relaxed">
              Join 50,000+ deal hunters. Get the best deals before they sell out.
            </p>
            {subscribed ? (
              <div className="bg-primary/20 text-primary border border-primary/30 rounded-lg p-4 text-sm font-medium">
                🎉 You're in! Check your inbox for your first deal alert.
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
                <Button type="submit" className="w-full font-semibold">Subscribe — It's Free</Button>
                <p className="text-[11px] text-accent-foreground/40 text-center">Unsubscribe anytime. No spam, ever.</p>
              </form>
            )}
            <div className="mt-8">
              <p className="text-xs text-accent-foreground/50 font-semibold uppercase tracking-wider mb-3">Featured Brands</p>
              <div className="flex flex-wrap gap-1.5">
                {topBrands.map((brand) => (
                  <Link key={brand} href={`/products?brand=${encodeURIComponent(brand)}`} className="text-xs bg-accent-foreground/10 text-accent-foreground/70 hover:bg-primary/20 hover:text-primary px-2 py-0.5 rounded-full transition-all">
                    {brand}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-accent-foreground/10 mt-14 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-accent-foreground/50 text-center md:text-left">
            &copy; {new Date().getFullYear()} DealHub Global. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Contact", href: "/contact" },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="text-xs text-accent-foreground/40 hover:text-primary transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="text-xs text-accent-foreground/30 text-center mt-4 max-w-3xl mx-auto leading-relaxed">
          Affiliate Disclosure: DealHub is reader-supported. When you buy through links on our site, we may earn an affiliate commission at no extra cost to you.
        </p>
      </div>
    </footer>
  );
}
