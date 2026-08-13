import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  productsTable,
  priceAlertsTable,
  userWishlistTable,
  userRecentlyViewedTable,
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router: IRouter = Router();

const MAX_RECENTLY_VIEWED = 20;

function serializePriceAlert(row: {
  id: number;
  productId: number;
  targetPrice: string;
  triggered: boolean;
  createdAt: Date;
  productTitle: string;
  productSlug: string;
  imageUrl: string;
  currentPrice: string;
}) {
  const targetPrice = Number(row.targetPrice);
  const currentPrice = Number(row.currentPrice);
  return {
    id: row.id,
    productId: row.productId,
    productTitle: row.productTitle,
    productSlug: row.productSlug,
    imageUrl: row.imageUrl,
    currentPrice,
    targetPrice,
    triggered: row.triggered || currentPrice <= targetPrice,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/user/wishlist", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rows = await db
    .select({ productId: userWishlistTable.productId })
    .from(userWishlistTable)
    .where(eq(userWishlistTable.userId, req.user.id));
  res.json({ productIds: rows.map((r) => r.productId) });
});

router.post("/user/wishlist/:productId", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const productId = parseInt(req.params.productId as string, 10);
  if (isNaN(productId)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }
  await db
    .insert(userWishlistTable)
    .values({ userId: req.user.id, productId })
    .onConflictDoNothing();
  const rows = await db
    .select({ productId: userWishlistTable.productId })
    .from(userWishlistTable)
    .where(eq(userWishlistTable.userId, req.user.id));
  res.json({ productIds: rows.map((r) => r.productId) });
});

router.delete("/user/wishlist/:productId", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const productId = parseInt(req.params.productId as string, 10);
  if (isNaN(productId)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }
  await db
    .delete(userWishlistTable)
    .where(
      and(
        eq(userWishlistTable.userId, req.user.id),
        eq(userWishlistTable.productId, productId),
      ),
    );
  const rows = await db
    .select({ productId: userWishlistTable.productId })
    .from(userWishlistTable)
    .where(eq(userWishlistTable.userId, req.user.id));
  res.json({ productIds: rows.map((r) => r.productId) });
});

router.get("/user/recently-viewed", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rows = await db
    .select({ productId: userRecentlyViewedTable.productId })
    .from(userRecentlyViewedTable)
    .where(eq(userRecentlyViewedTable.userId, req.user.id))
    .orderBy(desc(userRecentlyViewedTable.viewedAt))
    .limit(MAX_RECENTLY_VIEWED);
  res.json({ productIds: rows.map((r) => r.productId) });
});

router.post("/user/recently-viewed/:productId", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const productId = parseInt(req.params.productId as string, 10);
  if (isNaN(productId)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  await db
    .delete(userRecentlyViewedTable)
    .where(
      and(
        eq(userRecentlyViewedTable.userId, req.user.id),
        eq(userRecentlyViewedTable.productId, productId),
      ),
    );

  await db
    .insert(userRecentlyViewedTable)
    .values({ userId: req.user.id, productId });

  const allRows = await db
    .select({ productId: userRecentlyViewedTable.productId, id: userRecentlyViewedTable.id })
    .from(userRecentlyViewedTable)
    .where(eq(userRecentlyViewedTable.userId, req.user.id))
    .orderBy(desc(userRecentlyViewedTable.viewedAt));

  if (allRows.length > MAX_RECENTLY_VIEWED) {
    const toDelete = allRows.slice(MAX_RECENTLY_VIEWED).map((r) => r.id);
    for (const id of toDelete) {
      await db.delete(userRecentlyViewedTable).where(eq(userRecentlyViewedTable.id, id));
    }
  }

  const rows = allRows.slice(0, MAX_RECENTLY_VIEWED);
  res.json({ productIds: rows.map((r) => r.productId) });
});

router.get("/user/price-alerts", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rows = await db
    .select({
      id: priceAlertsTable.id,
      productId: priceAlertsTable.productId,
      targetPrice: priceAlertsTable.targetPrice,
      triggered: priceAlertsTable.triggered,
      createdAt: priceAlertsTable.createdAt,
      productTitle: productsTable.title,
      productSlug: productsTable.slug,
      imageUrl: productsTable.imageUrl,
      currentPrice: productsTable.price,
    })
    .from(priceAlertsTable)
    .innerJoin(productsTable, eq(priceAlertsTable.productId, productsTable.id))
    .where(eq(priceAlertsTable.userId, req.user.id))
    .orderBy(desc(priceAlertsTable.createdAt));

  res.json({ alerts: rows.map(serializePriceAlert) });
});

router.post("/user/price-alerts", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const productId = Number(req.body?.productId);
  const targetPrice = Number(req.body?.targetPrice);
  if (!Number.isInteger(productId) || productId <= 0 || !Number.isFinite(targetPrice) || targetPrice <= 0) {
    res.status(400).json({ error: "Product ID and a positive target price are required" });
    return;
  }

  const productRows = await db
    .select({
      id: productsTable.id,
      price: productsTable.price,
    })
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .limit(1);
  const product = productRows[0];
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const existing = await db
    .select({ id: priceAlertsTable.id })
    .from(priceAlertsTable)
    .where(and(eq(priceAlertsTable.userId, req.user.id), eq(priceAlertsTable.productId, productId)))
    .limit(1);

  const values = {
    targetPrice: targetPrice.toFixed(2),
    triggered: Number(product.price) <= targetPrice,
    updatedAt: new Date(),
  };

  if (existing[0]) {
    await db.update(priceAlertsTable).set(values).where(eq(priceAlertsTable.id, existing[0].id));
  } else {
    await db.insert(priceAlertsTable).values({
      userId: req.user.id,
      productId,
      ...values,
    });
  }

  const rows = await db
    .select({
      id: priceAlertsTable.id,
      productId: priceAlertsTable.productId,
      targetPrice: priceAlertsTable.targetPrice,
      triggered: priceAlertsTable.triggered,
      createdAt: priceAlertsTable.createdAt,
      productTitle: productsTable.title,
      productSlug: productsTable.slug,
      imageUrl: productsTable.imageUrl,
      currentPrice: productsTable.price,
    })
    .from(priceAlertsTable)
    .innerJoin(productsTable, eq(priceAlertsTable.productId, productsTable.id))
    .where(and(eq(priceAlertsTable.userId, req.user.id), eq(priceAlertsTable.productId, productId)))
    .limit(1);

  res.json(serializePriceAlert(rows[0]));
});

router.delete("/user/price-alerts/:productId", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const productId = parseInt(req.params.productId as string, 10);
  if (isNaN(productId)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  await db
    .delete(priceAlertsTable)
    .where(and(eq(priceAlertsTable.userId, req.user.id), eq(priceAlertsTable.productId, productId)));
  res.json({ success: true });
});

export default router;
