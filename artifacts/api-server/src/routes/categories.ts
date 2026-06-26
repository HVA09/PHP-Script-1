import { Router } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/categories", async (req, res) => {
  try {
    const cats = await db.select().from(categoriesTable);

    const counts = await db
      .select({
        category: productsTable.category,
        count: sql<number>`count(*)::int`,
      })
      .from(productsTable)
      .groupBy(productsTable.category);

    const countMap = new Map(counts.map((c) => [c.category, c.count]));

    const result = cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      productCount: countMap.get(c.slug) ?? 0,
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
