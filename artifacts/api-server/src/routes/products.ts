import { Router } from "express";
import { db, productsTable, categoriesTable, reviewsTable } from "@workspace/db";
import { ilike, eq, sql, and } from "drizzle-orm";
import {
  ListProductsQueryParams,
  GetProductParams,
} from "@workspace/api-zod";

const router = Router();

function mapProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    specifications: p.specifications ?? null,
    price: parseFloat(p.price),
    originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
    category: p.category,
    imageUrl: p.imageUrl,
    imageUrls: p.imageUrls?.length ? p.imageUrls : [p.imageUrl],
    storeName: p.storeName ?? null,
    affiliateUrl: p.affiliateUrl,
    rating: p.rating ? parseFloat(p.rating) : null,
    reviewCount: p.reviewCount,
    discountPercent: p.originalPrice && Number(p.originalPrice) > Number(p.price)
      ? Math.round(100 - (Number(p.price) / Number(p.originalPrice)) * 100)
      : null,
    badge: p.badge,
    featured: p.featured,
  };
}

router.get("/products/stats", async (req, res) => {
  try {
    const [totalProducts, totalCategories, featuredCount, avgPriceResult] =
      await Promise.all([
        db.select({ count: sql<number>`count(*)::int` }).from(productsTable),
        db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable),
        db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(eq(productsTable.featured, true)),
        db.select({ avg: sql<string>`avg(price::numeric)` }).from(productsTable),
      ]);

    res.json({
      totalProducts: totalProducts[0].count,
      totalCategories: totalCategories[0].count,
      featuredCount: featuredCount[0].count,
      avgPrice: avgPriceResult[0].avg ? parseFloat(avgPriceResult[0].avg) : null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get product stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const parsed = ListProductsQueryParams.safeParse(req.query);
    const params = parsed.success ? parsed.data : {};

    const conditions = [];
    if (params.search) conditions.push(ilike(productsTable.title, `%${params.search}%`));
    if (params.category) conditions.push(eq(productsTable.category, params.category));
    if (params.featured !== undefined) conditions.push(eq(productsTable.featured, params.featured));

    const rows = await db
      .select()
      .from(productsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    res.json(rows.map(mapProduct));
  } catch (err) {
    req.log.error({ err }, "Failed to list products");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/slug/:slug", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, req.params.slug));

    if (rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(mapProduct(rows[0]));
  } catch (err) {
    req.log.error({ err }, "Failed to get product by slug");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/:id/reviews", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid product id" });
      return;
    }

    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.productId, id))
      .orderBy(sql`helpful_count DESC, created_at DESC`);

    const breakdown = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    for (const r of reviews) {
      const k = String(r.rating) as keyof typeof breakdown;
      if (k in breakdown) breakdown[k]++;
    }

    res.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        productId: r.productId,
        reviewerName: r.reviewerName,
        reviewerLocation: r.reviewerLocation,
        rating: r.rating,
        title: r.title,
        body: r.body,
        verifiedPurchase: r.verifiedPurchase,
        helpfulCount: r.helpfulCount,
        createdAt: r.createdAt.toISOString(),
      })),
      totalCount: reviews.length,
      ratingBreakdown: breakdown,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list product reviews");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const parsed = GetProductParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid product id" });
      return;
    }

    const rows = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, parsed.data.id));

    if (rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(mapProduct(rows[0]));
  } catch (err) {
    req.log.error({ err }, "Failed to get product");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
