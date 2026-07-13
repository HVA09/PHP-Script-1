import { Router, type IRouter, type Request, type Response } from "express";
import { db, userWishlistTable, userRecentlyViewedTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router: IRouter = Router();

const MAX_RECENTLY_VIEWED = 20;

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

export default router;
