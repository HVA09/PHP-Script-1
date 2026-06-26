import { Link } from "wouter";
import { ShoppingBag } from "lucide-react";
import { useListCategories } from "@workspace/api-client-react";
import { getListCategoriesQueryKey } from "@workspace/api-client-react";

export function Footer() {
  const { data: categories } = useListCategories({ 
    query: { queryKey: getListCategoriesQueryKey() } 
  });

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 inline-flex">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">DealHub</span>
            </Link>
            <p className="text-muted-foreground max-w-xs leading-relaxed">
              Your curated source for the best products at the lowest prices. 
              We scour the web so you don't have to.
            </p>
          </div>
          
          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Top Categories</h4>
            <ul className="space-y-2.5 text-sm">
              {categories?.slice(0, 5).map(category => (
                <li key={category.id}>
                  <Link 
                    href={`/products?category=${category.slug}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              {!categories && Array.from({length: 4}).map((_, i) => (
                <li key={i} className="h-5 bg-muted rounded w-24 animate-pulse"></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} DealHub. All rights reserved. 
            <br className="md:hidden" />
            <span className="hidden md:inline"> • </span>
            DealHub is reader-supported. When you buy through links on our site, we may earn an affiliate commission.
          </p>
        </div>
      </div>
    </footer>
  );
}
