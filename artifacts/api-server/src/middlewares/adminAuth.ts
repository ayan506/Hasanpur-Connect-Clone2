import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { adminSessionsTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";

export async function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token =
    req.headers["x-admin-token"] as string ||
    req.cookies?.["admin_token"] as string;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [session] = await db
    .select()
    .from(adminSessionsTable)
    .where(
      and(
        eq(adminSessionsTable.token, token),
        eq(adminSessionsTable.isRevoked, false),
        gt(adminSessionsTable.expiresAt, new Date())
      )
    );

  if (!session) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }

  next();
}
