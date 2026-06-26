import { Router } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { ilike, eq, sql, and } from "drizzle-orm";
import {
  ListProductsQueryParams,
  GetProductParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/products/stats", async (req, res) => {
  try {
    const [totalProducts, totalCategories, featuredCount, avgPriceResult] =
      await Promise.all([
        db.select({ count: sql<number>`count(*)::int` }).from(productsTable),
        db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(productsTable)
          .where(eq(productsTable.featured, true)),
        db
          .select({ avg: sql<string>`avg(price::numeric)` })
          .from(productsTable),
      ]);

    res.json({
      totalProducts: totalProducts[0].count,
      totalCategories: totalCategories[0].count,
      featuredCount: featuredCount[0].count,
      avgPrice: avgPriceResult[0].avg
        ? parseFloat(avgPriceResult[0].avg)
        : null,
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

    if (params.search) {
      conditions.push(ilike(productsTable.title, `%${params.search}%`));
    }

    if (params.category) {
      conditions.push(eq(productsTable.category, params.category));
    }

    if (params.featured !== undefined) {
      conditions.push(eq(productsTable.featured, params.featured));
    }

    const rows = await db
      .select()
      .from(productsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const products = rows.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: parseFloat(p.price),
      originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
      category: p.category,
      imageUrl: p.imageUrl,
      affiliateUrl: p.affiliateUrl,
      rating: p.rating ? parseFloat(p.rating) : null,
      reviewCount: p.reviewCount,
      badge: p.badge,
      featured: p.featured,
    }));

    res.json(products);
  } catch (err) {
    req.log.error({ err }, "Failed to list products");
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

    const p = rows[0];
    res.json({
      id: p.id,
      title: p.title,
      description: p.description,
      price: parseFloat(p.price),
      originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
      category: p.category,
      imageUrl: p.imageUrl,
      affiliateUrl: p.affiliateUrl,
      rating: p.rating ? parseFloat(p.rating) : null,
      reviewCount: p.reviewCount,
      badge: p.badge,
      featured: p.featured,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get product");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
