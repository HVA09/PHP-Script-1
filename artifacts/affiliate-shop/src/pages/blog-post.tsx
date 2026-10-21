import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { ChevronRight, Clock, ArrowLeft, ArrowRight, Tag, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { getBlogPost, BLOG_POSTS, formatBlogDate } from "@/lib/blogData";
import { useSEO } from "@/hooks/useSEO";
import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";

function RelatedProducts({ slugs }: { slugs: string[] }) {
  const { data: allProducts } = useListProducts(
    {},
    { query: { queryKey: getListProductsQueryKey({}) } },
  );

  const related = allProducts?.filter((p) => slugs.includes(p.slug)) ?? [];
  if (related.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
        <ExternalLink className="w-5 h-5 text-primary" />
        Products Mentioned in This Article
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPost(slug ?? "");
  const blogRoute = `${(import.meta.env.BASE_URL || "/").replace(/\/$/, "")}/blog/${encodeURIComponent(slug ?? "")}`;
  const canonical = typeof window === "undefined" ? undefined : new URL(blogRoute, window.location.origin).href;
  useSEO({
    title: post?.title ?? "Article Not Found",
    description: post?.excerpt ?? "This article is unavailable. Browse product reviews and buying guides on DealHub.",
    image: post?.imageUrl,
    canonical,
    type: "article",
    noIndex: !post,
  });

  const currentIndex = BLOG_POSTS.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
  const nextPost = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [post]);

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-6">This article doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/blog">← Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero image */}
      <div className="relative aspect-[21/9] max-h-[440px] overflow-hidden">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        {/* Article header */}
        <div className="max-w-3xl mx-auto pt-8 pb-6 border-b">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge>{post.category}</Badge>
            <span className="text-muted-foreground text-sm flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {post.readTime} min read
            </span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">{formatBlogDate(post.date)}</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-5">
            {post.title}
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed mb-6">{post.excerpt}</p>

          {/* Author */}
          <div className="flex items-center gap-3">
            <img
              src={post.authorAvatar}
              alt={post.author}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-sm">{post.author}</p>
              <p className="text-muted-foreground text-xs">DealHub Editor</p>
            </div>
          </div>
        </div>

        {/* Article content */}
        <div className="max-w-3xl mx-auto py-8">
          <div
            className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-p:leading-relaxed prose-p:text-foreground/90
              prose-li:text-foreground/90 prose-li:leading-relaxed
              prose-strong:text-foreground prose-strong:font-semibold
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-ul:space-y-1 prose-ol:space-y-1"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap mt-10 pt-6 border-t">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs capitalize">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Related products */}
        <div className="max-w-5xl mx-auto">
          <RelatedProducts slugs={post.relatedProductSlugs} />
        </div>

        {/* Prev / Next navigation */}
        <div className="max-w-3xl mx-auto mt-12 pt-8 border-t grid grid-cols-2 gap-4">
          {prevPost ? (
            <Link href={`/blog/${prevPost.slug}`}>
              <div className="group flex flex-col gap-1 p-4 rounded-xl border hover:border-primary/40 hover:bg-muted/40 transition-all cursor-pointer">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Previous
                </span>
                <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                  {prevPost.title}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {nextPost ? (
            <Link href={`/blog/${nextPost.slug}`}>
              <div className="group flex flex-col gap-1 p-4 rounded-xl border hover:border-primary/40 hover:bg-muted/40 transition-all cursor-pointer text-right">
                <span className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                  Next <ArrowRight className="w-3 h-3" />
                </span>
                <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                  {nextPost.title}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Back to blog */}
        <div className="max-w-3xl mx-auto mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" /> All Articles
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
