import { type NextFunction, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

function isConfiguredAdmin(email: string | null | undefined) {
  if (!email) return false;
  const configuredEmails = new Set(
    (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
  return configuredEmails.has(email.toLowerCase());
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.user.isAdmin || isConfiguredAdmin(req.user.email)) {
    next();
    return;
  }

  const rows = await db
    .select({ isAdmin: usersTable.isAdmin })
    .from(usersTable)
    .where(eq(usersTable.id, req.user.id))
    .limit(1);

  if (rows[0]?.isAdmin) {
    next();
    return;
  }

  res.status(403).json({ error: "Administrator access required" });
}