import { Router } from "express";
import { db, categoriesTable, productsTable, reviewsTable } from "@workspace/db";
import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";

const router = Router();

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function mapProduct(product: typeof productsTable.$inferSelect) {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    specifications: product.specifications ?? null,
    price: Number(product.price),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    category: product.category,
    imageUrl: product.imageUrl,
    imageUrls: product.imageUrls?.length ? product.imageUrls : [product.imageUrl],
    storeName: product.storeName ?? null,
    affiliateUrl: product.affiliateUrl,
    rating: product.rating ? Number(product.rating) : null,
    reviewCount: product.reviewCount,
    discountPercent: product.originalPrice && Number(product.originalPrice) > Number(product.price)
      ? Math.round(100 - (Number(product.price) / Number(product.originalPrice)) * 100)
      : null,
    badge: product.badge,
    featured: product.featured,
  };
}

function optionalNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

function parseProductBody(body: Record<string, unknown>, partial = false) {
  const result: Record<string, unknown> = {};
  const requiredTextFields = ["title", "slug", "category", "imageUrl", "affiliateUrl"] as const;

  for (const field of requiredTextFields) {
    if (partial && body[field] === undefined) continue;
    const value = typeof body[field] === "string" ? body[field].trim() : "";
    if (!value) return { error: `${field} is required` };
    result[field] = value;
  }

  if (!partial || body.description !== undefined) {
    result.description = body.description === null || body.description === undefined
      ? null
      : String(body.description).trim();
  }
  if (!partial || body.imageUrls !== undefined) {
    const imageUrls = body.imageUrls === null || body.imageUrls === undefined
      ? null
      : body.imageUrls;
    if (imageUrls !== null && (!Array.isArray(imageUrls) || imageUrls.some((url) => typeof url !== "string" || !url.trim()))) {
      return { error: "imageUrls must be an array of non-empty URLs or null" };
    }
    if (Array.isArray(imageUrls)) {
      for (const imageUrl of imageUrls) {
        try {
          const parsedUrl = new URL(imageUrl as string);
          if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error("invalid protocol");
        } catch {
          return { error: "Every image URL must be a valid HTTP or HTTPS URL" };
        }
      }
    }
    result.imageUrls = imageUrls;
  }
  if (!partial || body.storeName !== undefined) {
    result.storeName = body.storeName === null || body.storeName === undefined
      ? null
      : String(body.storeName).trim() || null;
  }
  if (!partial || body.specifications !== undefined) {
    result.specifications = body.specifications === null || body.specifications === undefined
      ? null
      : body.specifications;
  }
  if (!partial || body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) return { error: "price must be greater than 0" };
    result.price = price.toFixed(2);
  }
  if (!partial || body.originalPrice !== undefined) {
    const originalPrice = optionalNullableNumber(body.originalPrice);
    if (Number.isNaN(originalPrice) || (originalPrice !== null && originalPrice <= 0)) {
      return { error: "originalPrice must be a positive number or null" };
    }
    result.originalPrice = originalPrice === null ? null : originalPrice.toFixed(2);
  }
  if (!partial || body.rating !== undefined) {
    const rating = optionalNullableNumber(body.rating);
    if (Number.isNaN(rating) || (rating !== null && (rating < 0 || rating > 5))) {
      return { error: "rating must be between 0 and 5 or null" };
    }
    result.rating = rating === null ? null : rating.toFixed(1);
  }
  if (!partial || body.reviewCount !== undefined) {
    const reviewCount = body.reviewCount === null || body.reviewCount === undefined || body.reviewCount === ""
      ? null
      : Number(body.reviewCount);
    if (reviewCount !== null && (!Number.isInteger(reviewCount) || reviewCount < 0)) {
      return { error: "reviewCount must be a non-negative integer or null" };
    }
    result.reviewCount = reviewCount;
  }
  if (!partial || body.badge !== undefined) {
    result.badge = body.badge === null || body.badge === undefined ? null : String(body.badge).trim();
  }
  if (!partial || body.featured !== undefined) {
    if (body.featured !== undefined && typeof body.featured !== "boolean") return { error: "featured must be boolean" };
    if (body.featured !== undefined) result.featured = body.featured;
  }
  if (typeof result.affiliateUrl === "string") {
    try {
      const url = new URL(result.affiliateUrl);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("invalid protocol");
    } catch {
      return { error: "affiliateUrl must be a valid http or https URL" };
    }
  }

  return { value: result };
}

function mapCategory(category: typeof categoriesTable.$inferSelect, productCount: number) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    productCount,
  };
}

async function listCategories() {
  const [categories, counts] = await Promise.all([
    db.select().from(categoriesTable).orderBy(asc(categoriesTable.name)),
    db
      .select({ category: productsTable.category, count: sql<number>`count(*)::int` })
      .from(productsTable)
      .groupBy(productsTable.category),
  ]);
  const countMap = new Map(counts.map((item) => [item.category, item.count]));
  return categories.map((category) => mapCategory(category, countMap.get(category.slug) ?? 0));
}

async function refreshReviewStats(productId: number) {
  const [stats] = await db
    .select({
      count: sql<number>`count(*)::int`,
      average: sql<string>`avg(${reviewsTable.rating})`,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.productId, productId));
  await db
    .update(productsTable)
    .set({
      reviewCount: stats.count,
      rating: stats.average ? Number(stats.average).toFixed(1) : null,
    })
    .where(eq(productsTable.id, productId));
}

router.get("/dashboard", async (req, res) => {
  try {
    const [productCount, categoryCount, reviewCount, featuredCount, averagePrice, averageRating, userCount, alertCount, categoryBreakdown, ratingBreakdown] =
      await Promise.all([
        db.select({ count: sql<number>`count(*)::int` }).from(productsTable),
        db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable),
        db.select({ count: sql<number>`count(*)::int` }).from(reviewsTable),
        db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(eq(productsTable.featured, true)),
        db.select({ value: sql<string>`avg(${productsTable.price})` }).from(productsTable),
        db.select({ value: sql<string>`avg(${productsTable.rating})` }).from(productsTable),
        db.execute(sql`select count(*)::int as count from users`),
        db.execute(sql`select count(*)::int as count from price_alerts`),
        db
          .select({ category: productsTable.category, count: sql<number>`count(*)::int` })
          .from(productsTable)
          .groupBy(productsTable.category)
          .orderBy(desc(sql`count(*)`)),
        db
          .select({ rating: reviewsTable.rating, count: sql<number>`count(*)::int` })
          .from(reviewsTable)
          .groupBy(reviewsTable.rating)
          .orderBy(asc(reviewsTable.rating)),
      ]);

    const recentProducts = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt)).limit(5);
    const reviewsByRating = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    for (const item of ratingBreakdown) {
      if (item.rating >= 1 && item.rating <= 5) reviewsByRating[String(item.rating) as keyof typeof reviewsByRating] = item.count;
    }

    res.json({
      totalProducts: productCount[0].count,
      totalCategories: categoryCount[0].count,
      totalReviews: reviewCount[0].count,
      featuredProducts: featuredCount[0].count,
      averagePrice: averagePrice[0].value ? Number(averagePrice[0].value) : null,
      averageRating: averageRating[0].value ? Number(averageRating[0].value) : null,
      totalUsers: Number(userCount.rows[0]?.count ?? 0),
      activePriceAlerts: Number(alertCount.rows[0]?.count ?? 0),
      categoryBreakdown,
      reviewsByRating,
      recentProducts: recentProducts.map(mapProduct),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to load admin dashboard");
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

router.get("/products", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const category = typeof req.query.category === "string" ? req.query.category : "";
  const filters = [];
  if (search) filters.push(ilike(productsTable.title, `%${search}%`));
  if (category) filters.push(eq(productsTable.category, category));
  const products = await db
    .select()
    .from(productsTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(productsTable.createdAt));
  res.json(products.map(mapProduct));
});

router.post("/products", async (req, res) => {
  const parsed = parseProductBody(req.body ?? {});
  if ("error" in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  try {
    const [product] = await db.insert(productsTable).values(parsed.value as typeof productsTable.$inferInsert).returning();
    res.status(201).json(mapProduct(product));
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "A product with this slug already exists" });
      return;
    }
    req.log.error({ err }, "Failed to create product");
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.patch("/products/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }
  const parsed = parseProductBody(req.body ?? {}, true);
  if ("error" in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  if (!Object.keys(parsed.value).length) {
    res.status(400).json({ error: "At least one field is required" });
    return;
  }
  try {
    const [product] = await db.update(productsTable).set(parsed.value).where(eq(productsTable.id, id)).returning();
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(mapProduct(product));
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "A product with this slug already exists" });
      return;
    }
    req.log.error({ err }, "Failed to update product");
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/products/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }
  const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning({ id: productsTable.id });
  if (!deleted) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ success: true });
});

router.get("/categories", async (_req, res) => {
  res.json(await listCategories());
});

router.post("/categories", async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const slug = typeof req.body?.slug === "string" ? req.body.slug.trim() : "";
  const icon = req.body?.icon === null || req.body?.icon === undefined ? null : String(req.body.icon).trim();
  if (!name || !slug) {
    res.status(400).json({ error: "name and slug are required" });
    return;
  }
  try {
    const [category] = await db.insert(categoriesTable).values({ name, slug, icon }).returning();
    res.status(201).json(mapCategory(category, 0));
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "A category with this slug already exists" });
      return;
    }
    req.log.error({ err }, "Failed to create category");
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.patch("/categories/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid category ID" });
    return;
  }
  const changes: Record<string, string | null> = {};
  if (req.body?.name !== undefined) changes.name = String(req.body.name).trim();
  if (req.body?.slug !== undefined) changes.slug = String(req.body.slug).trim();
  if (req.body?.icon !== undefined) changes.icon = req.body.icon === null ? null : String(req.body.icon).trim();
  if (Object.values(changes).some((value) => value !== null && !value)) {
    res.status(400).json({ error: "Category fields cannot be blank" });
    return;
  }
  if (!Object.keys(changes).length) {
    res.status(400).json({ error: "At least one field is required" });
    return;
  }
  try {
    const [currentCategory] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id)).limit(1);
    if (!currentCategory) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    const [category] = await db.update(categoriesTable).set(changes).where(eq(categoriesTable.id, id)).returning();
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    if (currentCategory.slug !== category.slug) {
      await db.update(productsTable).set({ category: category.slug }).where(eq(productsTable.category, currentCategory.slug));
    }
    const products = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(eq(productsTable.category, category.slug));
    res.json(mapCategory(category, products[0].count));
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "A category with this slug already exists" });
      return;
    }
    req.log.error({ err }, "Failed to update category");
    res.status(500).json({ error: "Failed to update category" });
  }
});

router.delete("/categories/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid category ID" });
    return;
  }
  const [category] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id)).limit(1);
  if (!category) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  const products = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(eq(productsTable.category, category.slug));
  if (products[0].count > 0) {
    res.status(409).json({ error: "Move or delete the products in this category first" });
    return;
  }
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.json({ success: true });
});

router.get("/affiliate-links", async (_req, res) => {
  const rows = await db
    .select({
      productId: productsTable.id,
      productTitle: productsTable.title,
      category: productsTable.category,
      price: productsTable.price,
      affiliateUrl: productsTable.affiliateUrl,
    })
    .from(productsTable)
    .orderBy(asc(productsTable.title));
  res.json(rows.map((row) => ({ ...row, price: Number(row.price) })));
});

router.patch("/affiliate-links/:productId", async (req, res) => {
  const productId = parseId(req.params.productId);
  const affiliateUrl = typeof req.body?.affiliateUrl === "string" ? req.body.affiliateUrl.trim() : "";
  if (!productId || !affiliateUrl) {
    res.status(400).json({ error: "A valid product ID and affiliate URL are required" });
    return;
  }
  try {
    const url = new URL(affiliateUrl);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("invalid protocol");
  } catch {
    res.status(400).json({ error: "Affiliate URL must be a valid http or https URL" });
    return;
  }
  const [product] = await db
    .update(productsTable)
    .set({ affiliateUrl })
    .where(eq(productsTable.id, productId))
    .returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({
    productId: product.id,
    productTitle: product.title,
    category: product.category,
    price: Number(product.price),
    affiliateUrl: product.affiliateUrl,
  });
});

router.get("/reviews", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const rating = typeof req.query.rating === "string" ? Number(req.query.rating) : null;
  const filters = [];
  if (search) {
    filters.push(sql`(${reviewsTable.reviewerName} ilike ${`%${search}%`} or ${reviewsTable.title} ilike ${`%${search}%`} or ${reviewsTable.body} ilike ${`%${search}%`} or ${productsTable.title} ilike ${`%${search}%`})`);
  }
  if (rating && rating >= 1 && rating <= 5) filters.push(eq(reviewsTable.rating, rating));
  const rows = await db
    .select({
      id: reviewsTable.id,
      productId: reviewsTable.productId,
      productTitle: productsTable.title,
      productSlug: productsTable.slug,
      reviewerName: reviewsTable.reviewerName,
      reviewerLocation: reviewsTable.reviewerLocation,
      rating: reviewsTable.rating,
      title: reviewsTable.title,
      body: reviewsTable.body,
      verifiedPurchase: reviewsTable.verifiedPurchase,
      helpfulCount: reviewsTable.helpfulCount,
      createdAt: reviewsTable.createdAt,
    })
    .from(reviewsTable)
    .innerJoin(productsTable, eq(reviewsTable.productId, productsTable.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(reviewsTable.createdAt));
  res.json(rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })));
});

router.patch("/reviews/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid review ID" });
    return;
  }
  const changes: Record<string, unknown> = {};
  if (req.body?.reviewerName !== undefined) changes.reviewerName = String(req.body.reviewerName).trim();
  if (req.body?.reviewerLocation !== undefined) changes.reviewerLocation = req.body.reviewerLocation === null ? null : String(req.body.reviewerLocation).trim();
  if (req.body?.rating !== undefined) {
    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: "rating must be an integer between 1 and 5" });
      return;
    }
    changes.rating = rating;
  }
  if (req.body?.title !== undefined) changes.title = String(req.body.title).trim();
  if (req.body?.body !== undefined) changes.body = String(req.body.body).trim();
  if (req.body?.verifiedPurchase !== undefined) {
    if (typeof req.body.verifiedPurchase !== "boolean") {
      res.status(400).json({ error: "verifiedPurchase must be boolean" });
      return;
    }
    changes.verifiedPurchase = req.body.verifiedPurchase;
  }
  if (!Object.keys(changes).length || Object.values(changes).some((value) => typeof value === "string" && !value)) {
    res.status(400).json({ error: "At least one non-empty field is required" });
    return;
  }
  const [review] = await db.update(reviewsTable).set(changes).where(eq(reviewsTable.id, id)).returning();
  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }
  await refreshReviewStats(review.productId);
  const [product] = await db.select({ title: productsTable.title, slug: productsTable.slug }).from(productsTable).where(eq(productsTable.id, review.productId)).limit(1);
  res.json({
    id: review.id,
    productId: review.productId,
    productTitle: product?.title ?? "Unknown product",
    productSlug: product?.slug ?? "",
    reviewerName: review.reviewerName,
    reviewerLocation: review.reviewerLocation,
    rating: review.rating,
    title: review.title,
    body: review.body,
    verifiedPurchase: review.verifiedPurchase,
    helpfulCount: review.helpfulCount,
    createdAt: review.createdAt.toISOString(),
  });
});

router.delete("/reviews/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid review ID" });
    return;
  }
  const [review] = await db.delete(reviewsTable).where(eq(reviewsTable.id, id)).returning({ id: reviewsTable.id, productId: reviewsTable.productId });
  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }
  await refreshReviewStats(review.productId);
  res.json({ success: true });
});

export default router;