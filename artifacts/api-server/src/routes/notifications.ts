import { Router } from "express";
import { db } from "@workspace/db";
import { adminNotificationsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAdminAuth } from "../middlewares/adminAuth";

const router = Router();

router.get("/", requireAdminAuth, async (_req, res) => {
  const notifications = await db.select().from(adminNotificationsTable)
    .orderBy(desc(adminNotificationsTable.createdAt))
    .limit(100);
  return res.json(notifications.map(n => ({ ...n, createdAt: n.createdAt?.toISOString() })));
});

router.get("/unread-count", requireAdminAuth, async (_req, res) => {
  const unread = await db.select().from(adminNotificationsTable)
    .where(eq(adminNotificationsTable.isRead, false));
  return res.json({ count: unread.length });
});

router.patch("/:id/read", requireAdminAuth, async (req, res) => {
  const [n] = await db.update(adminNotificationsTable)
    .set({ isRead: true })
    .where(eq(adminNotificationsTable.id, Number(req.params.id)))
    .returning();
  if (!n) return res.status(404).json({ error: "Not found" });
  return res.json({ ...n, createdAt: n.createdAt?.toISOString() });
});

router.patch("/mark-all-read", requireAdminAuth, async (_req, res) => {
  await db.update(adminNotificationsTable)
    .set({ isRead: true })
    .where(eq(adminNotificationsTable.isRead, false));
  return res.json({ success: true });
});

export default router;
