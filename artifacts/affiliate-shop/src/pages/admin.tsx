import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowUpRight,
  BarChart3,
  BellRing,
  Check,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  Link2,
  LogIn,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Tags,
  Trash2,
  Users,
} from "lucide-react";
import {
  getGetAdminDashboardQueryKey,
  getListAdminAffiliateLinksQueryKey,
  getListAdminCategoriesQueryKey,
  getListAdminProductsQueryKey,
  getListAdminReviewsQueryKey,
  useCreateAdminCategory,
  useCreateAdminProduct,
  useDeleteAdminCategory,
  useDeleteAdminProduct,
  useDeleteAdminReview,
  useGetAdminDashboard,
  useListAdminAffiliateLinks,
  useListAdminCategories,
  useListAdminProducts,
  useListAdminReviews,
  useUpdateAdminAffiliateLink,
  useUpdateAdminCategory,
  useUpdateAdminProduct,
  useUpdateAdminReview,
  type AdminCategoryCreateRequest,
  type AdminCategoryUpdateRequest,
  type AdminProductCreateRequest,
  type AdminProductUpdateRequest,
  type AdminReview,
  type AffiliateLink,
  type Category,
  type Product,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthContext } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "@/hooks/use-toast";

type Section = "dashboard" | "products" | "categories" | "affiliate-links" | "reviews";

const navigation: Array<{ key: Section; labelKey: "admin.overview" | "admin.products" | "admin.categories" | "admin.links" | "admin.reviews"; descriptionKey: "admin.catalogPulse" | "admin.manageInventory" | "admin.organizeShop" | "admin.keepReferrals" | "admin.curateTrust"; icon: typeof LayoutDashboard; href: string }> = [
  { key: "dashboard", labelKey: "admin.overview", descriptionKey: "admin.catalogPulse", icon: LayoutDashboard, href: "/admin" },
  { key: "products", labelKey: "admin.products", descriptionKey: "admin.manageInventory", icon: PackageOpen, href: "/admin/products" },
  { key: "categories", labelKey: "admin.categories", descriptionKey: "admin.organizeShop", icon: Tags, href: "/admin/categories" },
  { key: "affiliate-links", labelKey: "admin.links", descriptionKey: "admin.keepReferrals", icon: Link2, href: "/admin/affiliate-links" },
  { key: "reviews", labelKey: "admin.reviews", descriptionKey: "admin.curateTrust", icon: Star, href: "/admin/reviews" },
];

function getSection(path: string): Section {
  if (path === "/admin/products") return "products";
  if (path === "/admin/categories") return "categories";
  if (path === "/admin/affiliate-links") return "affiliate-links";
  if (path === "/admin/reviews") return "reviews";
  return "dashboard";
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function errorMessage(error: unknown) {
  const maybeError = error as { message?: string };
  return maybeError?.message || "Something went wrong. Please try again.";
}

function useAdminRefresh() {
  const queryClient = useQueryClient();
  return () => {
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getListAdminCategoriesQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getListAdminAffiliateLinksQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getListAdminReviewsQueryKey() }),
    ]);
  };
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-32 rounded-2xl" />)}
      </div>
      <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
  );
}

function StatCard({ label, value, detail, icon: Icon, accent = "primary" }: {
  label: string;
  value: string;
  detail: string;
  icon: typeof BarChart3;
  accent?: "primary" | "ink" | "gold" | "green";
}) {
  const accentStyles = {
    primary: "bg-primary/10 text-primary",
    ink: "bg-foreground/10 text-foreground",
    gold: "bg-amber-500/15 text-amber-700",
    green: "bg-emerald-500/15 text-emerald-700",
  };
  return (
    <Card className="border-black/5 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
            <p className="mt-3 font-display text-3xl font-bold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </div>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentStyles[accent]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminDashboard() {
  const { data, isLoading, isError, error } = useGetAdminDashboard();
  const { t } = useLanguage();
  useEffect(() => { document.title = "Admin overview — DealHub"; }, []);

  if (isLoading) return <PageSkeleton />;
  if (isError || !data) {
    return <ErrorState message={errorMessage(error)} />;
  }

  const maxCategoryCount = Math.max(...data.categoryBreakdown.map((item) => item.count), 1);
  const maxRatingCount = Math.max(...Object.values(data.reviewsByRating), 1);

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-primary">{t("admin.controlRoom")}</p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("admin.dashboardTitle")}</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t("admin.dashboardDescription")}</p>
        </div>
        <Button asChild variant="outline" className="w-fit gap-2">
          <Link href="/products">{t("admin.viewStorefront")} <ArrowUpRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products" value={String(data.totalProducts)} detail={`${data.featuredProducts} featured picks`} icon={PackageOpen} />
        <StatCard label="Categories" value={String(data.totalCategories)} detail="Catalog lanes in use" icon={FolderKanban} accent="ink" />
        <StatCard label="Reviews" value={String(data.totalReviews)} detail={`${data.averageRating?.toFixed(1) ?? "—"} average rating`} icon={Star} accent="gold" />
        <StatCard label="Price alerts" value={String(data.activePriceAlerts)} detail={`${data.totalUsers} registered shoppers`} icon={BellRing} accent="green" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-black/5 shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-black/5 pb-4">
            <div>
              <CardTitle className="text-lg">Catalog mix</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Products by category</p>
            </div>
            <BarChart3 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {data.categoryBreakdown.length === 0 ? (
              <EmptyState icon={FolderKanban} title="No categories yet" description="Add a category to start shaping the catalog." />
            ) : data.categoryBreakdown.map((item) => (
              <div key={item.category}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">{item.category}</span>
                  <span className="font-mono text-xs text-muted-foreground">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max((item.count / maxCategoryCount) * 100, 4)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-black/5 shadow-sm">
          <CardHeader className="border-b border-black/5 pb-4">
            <CardTitle className="text-lg">Review health</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Rating distribution across the catalog</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-end justify-between gap-3">
              {([5, 4, 3, 2, 1] as const).map((rating) => {
                const count = data.reviewsByRating[String(rating) as keyof typeof data.reviewsByRating];
                return (
                  <div key={rating} className="flex flex-1 flex-col items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{count}</span>
                    <div className="flex h-36 w-full items-end rounded-lg bg-muted/60 p-1">
                      <div className="w-full rounded-md bg-amber-400" style={{ height: `${Math.max((count / maxRatingCount) * 100, count ? 8 : 2)}%` }} />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{rating}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-black/5 shadow-sm">
        <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-black/5 pb-4">
          <div>
            <CardTitle className="text-lg">Recently added</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">The latest products in your editorial pipeline</p>
          </div>
          <Button asChild size="sm" variant="outline"><Link href="/admin/products">Manage products</Link></Button>
        </CardHeader>
        <CardContent className="p-0">
          {data.recentProducts.length === 0 ? <div className="p-6"><EmptyState icon={PackageOpen} title="No products yet" description="Your first product will appear here." /></div> : (
            <div className="divide-y divide-black/5">
              {data.recentProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                  <img src={product.imageUrl} alt="" className="h-12 w-12 rounded-lg bg-muted object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{product.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{product.category} <span className="mx-1">·</span> {formatCurrency(product.price)}</p>
                  </div>
                  {product.featured && <Badge variant="secondary">Featured</Badge>}
                  <Link href="/admin/products" className="text-muted-foreground transition-colors hover:text-primary"><ChevronRight className="h-4 w-4" /></Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <CircleAlert className="mb-3 h-9 w-9 text-destructive" />
        <h2 className="font-display text-xl font-bold">Could not load this workspace</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: typeof PackageOpen; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground"><Icon className="h-5 w-5" /></div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

type ProductFormState = {
  title: string;
  slug: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;
  imageUrl: string;
  imageUrls: string;
  storeName: string;
  affiliateUrl: string;
  rating: string;
  reviewCount: string;
  badge: string;
  featured: boolean;
  specifications: string;
};

const blankProductForm: ProductFormState = {
  title: "", slug: "", description: "", price: "", originalPrice: "", category: "", imageUrl: "", imageUrls: "", storeName: "", affiliateUrl: "",
  rating: "", reviewCount: "", badge: "", featured: false, specifications: "",
};

function ProductDialog({ open, onOpenChange, product, categories, onSubmit, pending }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  categories: Category[];
  onSubmit: (data: AdminProductCreateRequest | AdminProductUpdateRequest) => void;
  pending: boolean;
}) {
  const [form, setForm] = useState<ProductFormState>(blankProductForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm(product ? {
      title: product.title, slug: product.slug, description: product.description ?? "", price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "", category: product.category,
      imageUrl: product.imageUrl, imageUrls: product.imageUrls?.join("\n") ?? "", storeName: product.storeName ?? "",
      affiliateUrl: product.affiliateUrl, rating: product.rating ? String(product.rating) : "",
      reviewCount: product.reviewCount === null || product.reviewCount === undefined ? "" : String(product.reviewCount),
      badge: product.badge ?? "", featured: product.featured,
      specifications: product.specifications ? JSON.stringify(product.specifications, null, 2) : "",
    } : { ...blankProductForm, category: categories[0]?.slug ?? "" });
    setFormError("");
  }, [open, product, categories]);

  const set = (key: keyof ProductFormState, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.category.trim() || !form.imageUrl.trim() || !form.affiliateUrl.trim()) {
      setFormError("Title, slug, category, image, and affiliate URL are required.");
      return;
    }
    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Enter a valid price greater than zero.");
      return;
    }
    const imageUrls = [...new Set([
      form.imageUrl.trim(),
      ...form.imageUrls.split(/\r?\n/).map((url) => url.trim()).filter(Boolean),
    ])];
    try {
      for (const imageUrl of imageUrls) {
        const parsedUrl = new URL(imageUrl);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error();
      }
    } catch {
      setFormError("Gallery images must use valid HTTP or HTTPS URLs.");
      return;
    }
    let specifications: Record<string, string> | null = null;
    if (form.specifications.trim()) {
      try {
        const parsed = JSON.parse(form.specifications);
        if (!parsed || Array.isArray(parsed) || typeof parsed !== "object" || Object.values(parsed).some((value) => typeof value !== "string")) throw new Error();
        specifications = parsed;
      } catch {
        setFormError("Specifications must be a JSON object with text values.");
        return;
      }
    }
    const data = {
      title: form.title.trim(), slug: form.slug.trim(), description: form.description.trim() || null,
      specifications, price, originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      category: form.category.trim(), imageUrl: form.imageUrl.trim(), imageUrls,
      storeName: form.storeName.trim() || null, affiliateUrl: form.affiliateUrl.trim(),
      rating: form.rating ? Number(form.rating) : null, reviewCount: form.reviewCount ? Number(form.reviewCount) : null,
      badge: form.badge.trim() || null, featured: form.featured,
    };
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add a product"}</DialogTitle>
          <DialogDescription>{product ? "Update the catalog record and referral destination." : "Add a new deal to the storefront catalog."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          {formError && <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{formError}</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title"><Input value={form.title} onChange={(event) => set("title", event.target.value)} placeholder="Noise-canceling headphones" /></Field>
            <Field label="Slug"><Input value={form.slug} onChange={(event) => set("slug", event.target.value)} placeholder="noise-canceling-headphones" /></Field>
            <Field label="Price"><Input type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => set("price", event.target.value)} placeholder="79.99" /></Field>
            <Field label="Original price"><Input type="number" min="0" step="0.01" value={form.originalPrice} onChange={(event) => set("originalPrice", event.target.value)} placeholder="129.99" /></Field>
            <Field label="Category">
              <select value={form.category} onChange={(event) => set("category", event.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Select category</option>
                {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
              </select>
            </Field>
            <Field label="Badge"><Input value={form.badge} onChange={(event) => set("badge", event.target.value)} placeholder="Best seller" /></Field>
            <Field label="Image URL"><Input value={form.imageUrl} onChange={(event) => set("imageUrl", event.target.value)} placeholder="https://..." /></Field>
            <Field label="Store name"><Input value={form.storeName} onChange={(event) => set("storeName", event.target.value)} placeholder="Amazon, Best Buy, REI..." /></Field>
            <Field label="Affiliate URL"><Input value={form.affiliateUrl} onChange={(event) => set("affiliateUrl", event.target.value)} placeholder="https://partner.example/..." /></Field>
            <Field label="Rating"><Input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(event) => set("rating", event.target.value)} placeholder="4.7" /></Field>
            <Field label="Review count"><Input type="number" min="0" step="1" value={form.reviewCount} onChange={(event) => set("reviewCount", event.target.value)} placeholder="24" /></Field>
          </div>
          <Field label="Additional gallery image URLs" hint="One HTTP or HTTPS image URL per line. The main image above is included automatically.">
            <Textarea value={form.imageUrls} onChange={(event) => set("imageUrls", event.target.value)} className="min-h-24 font-mono text-xs" placeholder={"https://example.com/image-2.jpg\nhttps://example.com/image-3.jpg"} />
          </Field>
          <Field label="Description"><Textarea value={form.description} onChange={(event) => set("description", event.target.value)} placeholder="Why this deal deserves a spot on DealHub" /></Field>
          <Field label="Specifications" hint='Optional JSON object, for example {"Battery":"40 hours"}'>
            <Textarea value={form.specifications} onChange={(event) => set("specifications", event.target.value)} className="min-h-20 font-mono text-xs" placeholder='{"Battery":"40 hours"}' />
          </Field>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-black/5 bg-muted/40 px-3 py-3 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(event) => set("featured", event.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
            <span><span className="font-semibold">Feature this product</span><span className="block text-xs text-muted-foreground">Give it priority placement across the storefront.</span></span>
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : product ? "Save changes" : "Create product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdminProducts() {
  const queryClient = useQueryClient();
  const refresh = useAdminRefresh();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product>();
  const { data: products = [], isLoading, isError, error } = useListAdminProducts({ search: search || undefined });
  const { data: categories = [] } = useListAdminCategories();
  const createMutation = useCreateAdminProduct();
  const updateMutation = useUpdateAdminProduct();
  const deleteMutation = useDeleteAdminProduct();

  const save = (data: AdminProductCreateRequest | AdminProductUpdateRequest) => {
    const onSuccess = () => {
      setDialogOpen(false);
      setEditing(undefined);
      refresh();
      toast({ title: editing ? "Product updated" : "Product created", description: "The catalog is up to date." });
    };
    if (editing) updateMutation.mutate({ id: editing.id, data }, { onSuccess, onError: (mutationError) => toast({ title: "Could not update product", description: errorMessage(mutationError), variant: "destructive" }) });
    else createMutation.mutate({ data: data as AdminProductCreateRequest }, { onSuccess, onError: (mutationError) => toast({ title: "Could not create product", description: errorMessage(mutationError), variant: "destructive" }) });
  };

  const deleteProduct = (product: Product) => {
    if (!window.confirm(`Delete “${product.title}”? This also removes its reviews.`)) return;
    deleteMutation.mutate({ id: product.id }, {
      onSuccess: () => { void queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() }); void queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() }); toast({ title: "Product deleted" }); },
      onError: (mutationError) => toast({ title: "Could not delete product", description: errorMessage(mutationError), variant: "destructive" }),
    });
  };

  useEffect(() => { document.title = "Products — Admin — DealHub"; }, []);

  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Catalog / products" title="Products" description="Edit the details that power every deal card, product page, and referral click." action={<Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="gap-2"><Plus className="h-4 w-4" /> Add product</Button>} />
      <Card className="border-black/5 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="pl-9" />
          </div>
        </CardContent>
      </Card>
      {isLoading ? <Skeleton className="h-96 rounded-2xl" /> : isError ? <ErrorState message={errorMessage(error)} /> : (
        <Card className="border-black/5 shadow-sm">
          <CardHeader className="border-b border-black/5 pb-4"><CardTitle className="text-lg">{products.length} products</CardTitle></CardHeader>
          <CardContent className="p-0">
            {products.length === 0 ? <EmptyState icon={PackageOpen} title="No matching products" description="Try a different search or add your first deal." /> : (
              <Table>
                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell><div className="flex min-w-56 items-center gap-3"><img src={product.imageUrl} alt="" className="h-11 w-11 rounded-lg bg-muted object-cover" /><div className="min-w-0"><p className="truncate font-semibold">{product.title}</p><p className="truncate text-xs text-muted-foreground">/{product.slug}</p></div></div></TableCell>
                      <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{formatCurrency(product.price)}</TableCell>
                      <TableCell>{product.featured ? <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-400">Featured</Badge> : <span className="text-xs text-muted-foreground">Standard</span>}</TableCell>
                      <TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" aria-label={`Edit ${product.title}`} onClick={() => { setEditing(product); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${product.title}`} onClick={() => deleteProduct(product)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
      <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} product={editing} categories={categories} onSubmit={save} pending={createMutation.isPending || updateMutation.isPending} />
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p><h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p></div>
      {action}
    </div>
  );
}

function CategoryDialog({ open, onOpenChange, category, onSubmit, pending }: { open: boolean; onOpenChange: (open: boolean) => void; category?: Category; onSubmit: (data: AdminCategoryCreateRequest | AdminCategoryUpdateRequest) => void; pending: boolean }) {
  const [form, setForm] = useState({ name: "", slug: "", icon: "" });
  useEffect(() => { if (open) setForm(category ? { name: category.name, slug: category.slug, icon: category.icon ?? "" } : { name: "", slug: "", icon: "" }); }, [open, category]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{category ? "Edit category" : "Add a category"}</DialogTitle><DialogDescription>Use a clear name and stable slug for filters and product records.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (!form.name.trim() || !form.slug.trim()) return; onSubmit({ name: form.name.trim(), slug: form.slug.trim(), icon: form.icon.trim() || null }); }}>
          <Field label="Name"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Tech & gadgets" /></Field>
          <Field label="Slug"><Input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="tech-gadgets" /></Field>
          <Field label="Icon" hint="Optional icon name or short label."><Input value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} placeholder="sparkles" /></Field>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={pending}>{pending ? "Saving..." : category ? "Save changes" : "Create category"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdminCategories() {
  const refresh = useAdminRefresh();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category>();
  const { data: categories = [], isLoading, isError, error } = useListAdminCategories();
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const deleteMutation = useDeleteAdminCategory();
  const save = (data: AdminCategoryCreateRequest | AdminCategoryUpdateRequest) => {
    const onSuccess = () => { setDialogOpen(false); setEditing(undefined); refresh(); toast({ title: editing ? "Category updated" : "Category created" }); };
    if (editing) updateMutation.mutate({ id: editing.id, data }, { onSuccess, onError: (mutationError) => toast({ title: "Could not update category", description: errorMessage(mutationError), variant: "destructive" }) });
    else createMutation.mutate({ data: data as AdminCategoryCreateRequest }, { onSuccess, onError: (mutationError) => toast({ title: "Could not create category", description: errorMessage(mutationError), variant: "destructive" }) });
  };
  const deleteCategory = (category: Category) => {
    if (!window.confirm(`Delete “${category.name}”?`)) return;
    deleteMutation.mutate({ id: category.id }, { onSuccess: () => { refresh(); toast({ title: "Category deleted" }); }, onError: (mutationError) => toast({ title: "Could not delete category", description: errorMessage(mutationError), variant: "destructive" }) });
  };
  useEffect(() => { document.title = "Categories — Admin — DealHub"; }, []);
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Catalog / taxonomy" title="Categories" description="Keep the storefront easy to browse by maintaining the lanes products belong to." action={<Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="gap-2"><Plus className="h-4 w-4" /> Add category</Button>} />
      {isLoading ? <Skeleton className="h-96 rounded-2xl" /> : isError ? <ErrorState message={errorMessage(error)} /> : (
        <Card className="border-black/5 shadow-sm">
          <CardHeader className="border-b border-black/5 pb-4"><CardTitle className="text-lg">{categories.length} categories</CardTitle></CardHeader>
          <CardContent className="p-0">
            {categories.length === 0 ? <EmptyState icon={Tags} title="No categories yet" description="Create your first category to structure the catalog." /> : (
              <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Products</TableHead><TableHead>Icon</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
                {categories.map((category) => <TableRow key={category.id}><TableCell className="font-semibold">{category.name}</TableCell><TableCell className="font-mono text-xs text-muted-foreground">{category.slug}</TableCell><TableCell><Badge variant="secondary">{category.productCount}</Badge></TableCell><TableCell className="text-sm text-muted-foreground">{category.icon || "—"}</TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => { setEditing(category); setDialogOpen(true); }} aria-label={`Edit ${category.name}`}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteCategory(category)} aria-label={`Delete ${category.name}`}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell></TableRow>)}
              </TableBody></Table>
            )}
          </CardContent>
        </Card>
      )}
      <CategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editing} onSubmit={save} pending={createMutation.isPending || updateMutation.isPending} />
    </div>
  );
}

function AdminAffiliateLinks() {
  const refresh = useAdminRefresh();
  const { data: links = [], isLoading, isError, error } = useListAdminAffiliateLinks();
  const updateMutation = useUpdateAdminAffiliateLink();
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  useEffect(() => { document.title = "Affiliate links — Admin — DealHub"; }, []);
  const valueFor = (link: AffiliateLink) => drafts[link.productId] ?? link.affiliateUrl;
  const save = (link: AffiliateLink) => {
    const affiliateUrl = valueFor(link).trim();
    updateMutation.mutate({ productId: link.productId, data: { affiliateUrl } }, { onSuccess: () => { refresh(); setDrafts((current) => { const next = { ...current }; delete next[link.productId]; return next; }); toast({ title: "Affiliate link updated" }); }, onError: (mutationError) => toast({ title: "Could not update link", description: errorMessage(mutationError), variant: "destructive" }) });
  };
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Monetization / referrals" title="Affiliate links" description="Keep every outbound destination current. These URLs are attached directly to the product records." />
      <Card className="border-primary/20 bg-primary/[0.04] shadow-sm"><CardContent className="flex gap-3 p-4"><Link2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><p className="text-sm text-muted-foreground">A valid HTTP or HTTPS URL is required. Changes are live anywhere the product's primary action appears.</p></CardContent></Card>
      {isLoading ? <Skeleton className="h-96 rounded-2xl" /> : isError ? <ErrorState message={errorMessage(error)} /> : (
        <Card className="border-black/5 shadow-sm">
          <CardHeader className="border-b border-black/5 pb-4"><CardTitle className="text-lg">{links.length} referral destinations</CardTitle></CardHeader>
          <CardContent className="p-0">
            {links.length === 0 ? <EmptyState icon={Link2} title="No affiliate links" description="Product referral destinations will appear here." /> : <Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead className="min-w-96">Affiliate URL</TableHead><TableHead className="text-right">Save</TableHead></TableRow></TableHeader><TableBody>
              {links.map((link) => <TableRow key={link.productId}><TableCell className="min-w-56 font-semibold">{link.productTitle}</TableCell><TableCell><Badge variant="outline">{link.category}</Badge></TableCell><TableCell className="font-mono text-xs">{formatCurrency(link.price)}</TableCell><TableCell><Input value={valueFor(link)} onChange={(event) => setDrafts((current) => ({ ...current, [link.productId]: event.target.value }))} className="font-mono text-xs" /></TableCell><TableCell className="text-right"><Button size="sm" variant={drafts[link.productId] !== undefined ? "default" : "outline"} disabled={drafts[link.productId] === undefined || updateMutation.isPending} onClick={() => save(link)} className="gap-1.5"><Check className="h-3.5 w-3.5" /> Save</Button></TableCell></TableRow>)}
            </TableBody></Table>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReviewDialog({ review, open, onOpenChange, onSubmit, pending }: { review?: AdminReview; open: boolean; onOpenChange: (open: boolean) => void; onSubmit: (data: Record<string, unknown>) => void; pending: boolean }) {
  const [form, setForm] = useState({ reviewerName: "", reviewerLocation: "", rating: "5", title: "", body: "", verifiedPurchase: false });
  useEffect(() => { if (open && review) setForm({ reviewerName: review.reviewerName, reviewerLocation: review.reviewerLocation ?? "", rating: String(review.rating), title: review.title, body: review.body, verifiedPurchase: review.verifiedPurchase }); }, [open, review]);
  if (!review) return null;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>Edit review</DialogTitle><DialogDescription>Editing the review for {review.productTitle}.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); onSubmit({ reviewerName: form.reviewerName.trim(), reviewerLocation: form.reviewerLocation.trim() || null, rating: Number(form.rating), title: form.title.trim(), body: form.body.trim(), verifiedPurchase: form.verifiedPurchase }); }}><div className="grid gap-4 sm:grid-cols-2"><Field label="Reviewer"><Input value={form.reviewerName} onChange={(event) => setForm({ ...form, reviewerName: event.target.value })} /></Field><Field label="Location"><Input value={form.reviewerLocation} onChange={(event) => setForm({ ...form, reviewerLocation: event.target.value })} /></Field><Field label="Rating"><Input type="number" min="1" max="5" value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })} /></Field><Field label="Title"><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field></div><Field label="Review body"><Textarea value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} className="min-h-32" /></Field><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.verifiedPurchase} onChange={(event) => setForm({ ...form, verifiedPurchase: event.target.checked })} className="h-4 w-4 accent-[hsl(var(--primary))]" /> Verified purchase</label><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save review"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

function AdminReviews() {
  const refresh = useAdminRefresh();
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("");
  const [editing, setEditing] = useState<AdminReview>();
  const { data: reviews = [], isLoading, isError, error } = useListAdminReviews({ search: search || undefined, rating: rating ? Number(rating) : undefined });
  const updateMutation = useUpdateAdminReview();
  const deleteMutation = useDeleteAdminReview();
  useEffect(() => { document.title = "Reviews — Admin — DealHub"; }, []);
  const save = (data: Record<string, unknown>) => updateMutation.mutate({ id: editing!.id, data }, { onSuccess: () => { setEditing(undefined); refresh(); toast({ title: "Review updated" }); }, onError: (mutationError) => toast({ title: "Could not update review", description: errorMessage(mutationError), variant: "destructive" }) });
  const deleteReview = (review: AdminReview) => {
    if (!window.confirm(`Delete this review by ${review.reviewerName}?`)) return;
    deleteMutation.mutate({ id: review.id }, { onSuccess: () => { refresh(); toast({ title: "Review deleted" }); }, onError: (mutationError) => toast({ title: "Could not delete review", description: errorMessage(mutationError), variant: "destructive" }) });
  };
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Trust / moderation" title="Reviews" description="Keep the voice of the storefront useful, accurate, and worthy of a shopper's trust." />
      <Card className="border-black/5 shadow-sm"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reviewer, title, or product..." className="pl-9" /></div><select value={rating} onChange={(event) => setRating(event.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm sm:w-40"><option value="">All ratings</option><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select></CardContent></Card>
      {isLoading ? <Skeleton className="h-96 rounded-2xl" /> : isError ? <ErrorState message={errorMessage(error)} /> : <Card className="border-black/5 shadow-sm"><CardHeader className="border-b border-black/5 pb-4"><CardTitle className="text-lg">{reviews.length} reviews</CardTitle></CardHeader><CardContent className="p-0">{reviews.length === 0 ? <EmptyState icon={Star} title="No reviews found" description="Try clearing a filter or wait for the next shopper signal." /> : <Table><TableHeader><TableRow><TableHead>Review</TableHead><TableHead>Rating</TableHead><TableHead>Product</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{reviews.map((review) => <TableRow key={review.id}><TableCell className="min-w-72"><div className="max-w-md"><p className="truncate font-semibold">{review.title}</p><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{review.body}</p><p className="mt-2 text-xs font-medium">{review.reviewerName}{review.verifiedPurchase && <Badge variant="secondary" className="ml-2 text-[10px]">Verified</Badge>}</p></div></TableCell><TableCell><span className="flex items-center gap-1 font-mono text-xs"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {review.rating}</span></TableCell><TableCell className="max-w-44 truncate text-sm">{review.productTitle}</TableCell><TableCell className="whitespace-nowrap text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => setEditing(review)} aria-label={`Edit review by ${review.reviewerName}`}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteReview(review)} aria-label={`Delete review by ${review.reviewerName}`}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card>}
      <ReviewDialog review={editing} open={!!editing} onOpenChange={(open) => { if (!open) setEditing(undefined); }} onSubmit={save} pending={updateMutation.isPending} />
    </div>
  );
}

function AccessDenied({ authenticated, login }: { authenticated: boolean; login: () => void }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="max-w-lg border-black/5 shadow-xl">
        <CardContent className="flex flex-col items-center p-10 text-center sm:p-14">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck className="h-8 w-8" /></div>
          <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Restricted workspace</p>
          <h1 className="font-display text-3xl font-bold">Admin access required</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{authenticated ? "Your account is signed in, but it does not have administrator permission. Ask a workspace owner to grant access." : "Sign in with an administrator account to manage the DealHub catalog."}</p>
          {!authenticated && <Button onClick={login} className="mt-7 gap-2"><LogIn className="h-4 w-4" /> Sign in</Button>}
          <Button asChild variant="link" className="mt-3"><Link href="/">Return to storefront</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Admin() {
  const [location] = useLocation();
  const { user, isLoading, isAuthenticated, login } = useAuthContext();
  const { t } = useLanguage();
  const adminProbe = useGetAdminDashboard({
    query: {
      queryKey: getGetAdminDashboardQueryKey(),
      enabled: isAuthenticated && !isLoading,
      retry: false,
    },
  });
  const section = getSection(location);
  const localizedNavigation = navigation.map((item) => ({
    ...item,
    label: t(item.labelKey),
    description: t(item.descriptionKey),
  }));
  const current = localizedNavigation.find((item) => item.key === section) ?? localizedNavigation[0];
  useEffect(() => { document.title = `${current.label} — Admin — DealHub`; }, [current.label]);

  if (isLoading || (isAuthenticated && adminProbe.isLoading)) return <div className="min-h-screen bg-[#f7f3eb] p-6"><PageSkeleton /></div>;
  if (!isAuthenticated || adminProbe.isError || !user) return <div className="min-h-screen bg-[#f7f3eb]"><AccessDenied authenticated={isAuthenticated} login={login} /></div>;

  const content = section === "products" ? <AdminProducts /> : section === "categories" ? <AdminCategories /> : section === "affiliate-links" ? <AdminAffiliateLinks /> : section === "reviews" ? <AdminReviews /> : <AdminDashboard />;
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Admin";

  return (
    <div className="min-h-screen bg-[#f7f3eb] text-foreground">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-black/5 bg-[#201f1d] px-5 py-6 text-white lg:flex">
          <Link href="/" className="mb-12 flex items-center gap-3 px-2"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold">D</span><span><span className="block font-display text-xl font-bold tracking-tight">DealHub</span><span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">Admin desk</span></span></Link>
          <nav className="space-y-1.5">
            {localizedNavigation.map((item) => { const Icon = item.icon; const active = item.key === section; return <Link key={item.key} href={item.href} className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${active ? "bg-white text-foreground" : "text-white/60 hover:bg-white/10 hover:text-white"}`}><Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} /><span className="min-w-0"><span className="block text-sm font-semibold">{item.label}</span><span className={`block text-[10px] ${active ? "text-muted-foreground" : "text-white/35"}`}>{item.description}</span></span></Link>; })}
          </nav>
          <div className="mt-auto space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] font-mono uppercase tracking-[0.16em] text-white/35">Signed in as</p><p className="mt-2 truncate text-sm font-semibold">{displayName}</p><p className="mt-1 truncate text-xs text-white/45">{user.email}</p></div>
            <Link href="/" className="flex items-center gap-2 px-3 text-xs font-semibold text-white/45 transition-colors hover:text-white"><ExternalLink className="h-3.5 w-3.5" /> Open storefront</Link>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-[#f7f3eb]/90 px-4 py-4 backdrop-blur-md sm:px-8 lg:px-10">
            <div className="flex items-center gap-3 lg:hidden"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display font-bold text-white">D</span><span className="font-display font-bold">DealHub <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Admin</span></span></div>
            <div className="hidden lg:block"><span className="text-sm font-semibold">{current.label}</span><span className="mx-2 text-muted-foreground">/</span><span className="text-sm text-muted-foreground">DealHub control room</span></div>
            <div className="flex items-center gap-3 lg:ml-auto"><span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Protected session</span><Button asChild variant="outline" size="sm"><Link href="/profile">{displayName}</Link></Button></div>
          </header>
          <div className="border-b border-black/5 bg-[#201f1d] px-4 py-2 lg:hidden"><div className="flex gap-2 overflow-x-auto">{localizedNavigation.map((item) => <Link key={item.key} href={item.href} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${section === item.key ? "bg-white text-foreground" : "text-white/60"}`}>{item.label}</Link>)}</div></div>
          <div className="px-4 py-8 sm:px-8 lg:px-10 lg:py-10">{content}</div>
        </main>
      </div>
    </div>
  );
}