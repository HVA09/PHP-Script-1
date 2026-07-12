import { Link } from "wouter";
import { ShoppingBag, ChevronRight, Users, Zap, Shield, Star, Globe, Heart } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const team = [
  { name: "Alex Rivera", role: "Founder & CEO", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80" },
  { name: "Sarah Chen", role: "Head of Curation", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b88c?w=100&q=80" },
  { name: "Marcus Johnson", role: "Lead Developer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" },
  { name: "Priya Patel", role: "Partnerships Manager", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" },
];

const values = [
  { icon: Shield, title: "Transparency First", desc: "We always clearly disclose our affiliate relationships. No hidden agendas — ever." },
  { icon: Star, title: "Quality Over Quantity", desc: "Every product is hand-reviewed by our editorial team before it makes the site." },
  { icon: Zap, title: "Best Price Always", desc: "We actively monitor prices and only feature deals that represent genuine value." },
  { icon: Globe, title: "Global Reach", desc: "We source products from retailers worldwide so you get access to the best deals regardless of where you shop." },
  { icon: Users, title: "Community-Driven", desc: "Our community of 50,000+ shoppers helps surface the best deals through reviews and feedback." },
  { icon: Heart, title: "No Cost to You", desc: "We earn a small commission from retailers — you never pay extra. It's a win-win." },
];

const stats = [
  { value: "50K+", label: "Happy Shoppers" },
  { value: "22+", label: "Curated Products" },
  { value: "6", label: "Categories" },
  { value: "$2M+", label: "Savings Generated" },
];

export default function About() {
  useSEO({
    title: "About DealHub",
    description: "Learn about DealHub's mission to help shoppers find the best deals on the web. Meet our team and discover our values.",
    keywords: "about dealhub, affiliate marketplace, deal curation, shopping deals",
  });

  return (
    <div className="pb-20">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">About</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-accent text-accent-foreground py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl">
          <div className="flex justify-center mb-6">
            <div className="bg-primary text-primary-foreground p-4 rounded-2xl">
              <ShoppingBag className="w-10 h-10" />
            </div>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight mb-6">
            We help you <span className="text-primary">shop smarter.</span>
          </h1>
          <p className="text-accent-foreground/75 text-lg max-w-2xl mx-auto leading-relaxed">
            DealHub is a curated global affiliate marketplace. We spend thousands of hours researching products so you can make confident buying decisions in seconds.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-12 relative z-10 max-w-4xl">
        <div className="bg-card border rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-border">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center px-4 py-2 md:py-0">
                <p className="font-display text-4xl font-bold text-primary mb-1">{value}</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>In a world flooded with advertising and sponsored content, finding genuinely good products at honest prices is harder than ever. We started DealHub to fix that.</p>
              <p>Every product on DealHub is reviewed by a real human editor — not an algorithm. We test quality, verify pricing, check return policies, and read hundreds of real customer reviews before we'll recommend anything.</p>
              <p>Our revenue comes from affiliate commissions — but that never influences which products we feature. If it's not good enough for our own family, it won't appear on DealHub.</p>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80"
              alt="Team collaboration"
              className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
            />
            <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground p-4 rounded-xl shadow-xl">
              <p className="font-display text-2xl font-bold">Since 2021</p>
              <p className="text-xs text-primary-foreground/80">Curating the best deals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/40 border-y py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">Our Values</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">The principles we never compromise on, no matter what.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container mx-auto px-4 py-20 max-w-4xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">Meet the Team</h2>
        <p className="text-center text-muted-foreground mb-12">Real people dedicated to finding you the best deals.</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {team.map(({ name, role, avatar }) => (
            <div key={name} className="text-center">
              <img src={avatar} alt={name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-primary/20" />
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 max-w-2xl text-center">
        <div className="bg-accent text-accent-foreground rounded-3xl p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <h2 className="font-display text-3xl font-bold mb-4 relative z-10">Ready to shop smarter?</h2>
          <p className="text-accent-foreground/75 mb-6 relative z-10">Discover 22+ hand-curated products across 6 categories.</p>
          <Link href="/products" className="relative z-10 inline-flex items-center bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity">
            Browse All Deals
          </Link>
        </div>
      </section>
    </div>
  );
}
