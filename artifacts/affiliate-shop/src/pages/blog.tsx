import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ChevronRight, Clock, ArrowRight, BookOpen, TrendingUp, Rss } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BLOG_POSTS, getFeaturedPosts, formatBlogDate, type BlogPost } from "@/lib/blogData";

const CATEGORIES = ["All", "Electronics", "Home & Kitchen", "Sports & Outdoors", "Beauty & Health", "Books"];

function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`}>
        <article className="group relative overflow-hidden rounded-2xl bg-accent cursor-pointer h-full">
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary text-primary-foreground text-xs">{post.category}</Badge>
              <span className="text-white/70 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" /> {post.readTime} min read
              </span>
            </div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-white leading-tight mb-2 group-hover:text-primary-foreground transition-colors">
              {post.title}
            </h2>
            <p className="text-white/75 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
            <div className="flex items-center gap-2">
              <img src={post.authorAvatar} alt={post.author} className="w-6 h-6 rounded-full object-cover" />
              <span className="text-white/80 text-xs">{post.author}</span>
              <span className="text-white/50 text-xs">·</span>
              <span className="text-white/60 text-xs">{formatBlogDate(post.date)}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group flex flex-col bg-card border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full">
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">{post.category}</Badge>
            <span className="text-muted-foreground text-xs flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" /> {post.readTime} min
            </span>
          </div>
          <h3 className="font-display font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 flex-1 mb-4">{post.excerpt}</p>
          <div className="flex items-center gap-2 pt-3 border-t">
            <img src={post.authorAvatar} alt={post.author} className="w-7 h-7 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{post.author}</p>
              <p className="text-xs text-muted-foreground">{formatBlogDate(post.date)}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "Blog — DealHub | Product Reviews & Buying Guides";
  }, []);

  const featured = getFeaturedPosts().slice(0, 3);
  const filtered = BLOG_POSTS.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="pb-20">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Blog</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-accent to-accent/60 border-b py-14">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-1.5 bg-primary/15 text-primary border border-primary/25 px-3 py-1 rounded-full text-sm font-semibold mb-5">
            <Rss className="w-3.5 h-3.5" /> Product Reviews & Buying Guides
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            The DealHub Blog
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            In-depth reviews, expert buying guides, and honest takes on the products worth your money.
          </p>
          <div className="flex items-center max-w-md mx-auto gap-2">
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background"
            />
            {searchQuery && (
              <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>Clear</Button>
            )}
          </div>
        </div>
      </section>

      {/* Featured posts */}
      {!searchQuery && activeCategory === "All" && featured.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Featured Articles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <BlogCard post={featured[0]} featured />
            </div>
            <div className="flex flex-col gap-6">
              {featured.slice(1).map((p) => (
                <BlogCard key={p.slug} post={p} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category filter */}
      <div className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0 border transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* All posts grid */}
      <section className="container mx-auto px-4 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No articles found</h3>
            <p className="text-muted-foreground text-sm mb-4">Try a different search term or category.</p>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {filtered.length} article{filtered.length !== 1 ? "s" : ""}
                {activeCategory !== "All" && ` in ${activeCategory}`}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="container mx-auto px-4 pb-4">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-primary-foreground text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
            Get the Best Deals in Your Inbox
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
            Weekly roundups of the top deals, new reviews, and exclusive discount codes. No spam.
          </p>
          <form className="flex gap-2 max-w-sm mx-auto" onSubmit={(e) => e.preventDefault()}>
            <Input
              placeholder="your@email.com"
              type="email"
              className="bg-white/20 border-white/30 placeholder:text-white/60 text-white"
            />
            <Button variant="secondary" type="submit" className="shrink-0">Subscribe</Button>
          </form>
        </div>
      </section>
    </div>
  );
}
