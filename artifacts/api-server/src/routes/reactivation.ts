import { Router } from "express";
import { db } from "@workspace/db";
import { reactivationRequestsTable, businessesTable, adminNotificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdminAuth } from "../middlewares/adminAuth";

const router = Router();

router.post("/", async (req, res) => {
  const { businessId, reason } = req.body;
  if (!businessId || !reason) return res.status(400).json({ error: "businessId and reason required" });

  const [biz] = await db.select().from(businessesTable).where(eq(businessesTable.id, Number(businessId))).limit(1);
  if (!biz) return res.status(404).json({ error: "Business not found" });
  if (!biz.isSuspended) return res.status(400).json({ error: "Business is not suspended" });

  const [req2] = await db.insert(reactivationRequestsTable).values({
    businessId: Number(businessId),
    reason,
    status: "pending",
  }).returning();

  await db.insert(adminNotificationsTable).values({
    type: "reactivation_request",
    title: "Reactivation Request",
    message: `${biz.name} has submitted a reactivation request: "${reason.slice(0, 100)}"`,
    entityId: biz.id,
    entityType: "business",
  }).catch(() => {});

  return res.status(201).json({ id: req2.id, ok: true });
});

router.get("/", requireAdminAuth, async (_req, res) => {
  const rows = await db.select().from(reactivationRequestsTable).orderBy(desc(reactivationRequestsTable.createdAt)).limit(100);
  return res.json(rows.map(r => ({ ...r, createdAt: r.createdAt?.toISOString() ?? null, reviewedAt: r.reviewedAt?.toISOString() ?? null })));
});

router.patch("/:id", requireAdminAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  const { action, adminNotes } = req.body;
  if (!action) return res.status(400).json({ error: "action required (approve|reject)" });

  const [reqRow] = await db.select().from(reactivationRequestsTable).where(eq(reactivationRequestsTable.id, id)).limit(1);
  if (!reqRow) return res.status(404).json({ error: "Not found" });

  await db.update(reactivationRequestsTable).set({
    status: action === "approve" ? "approved" : "rejected",
    adminNotes: adminNotes ?? null,
    reviewedAt: new Date(),
  }).where(eq(reactivationRequestsTable.id, id));

  if (action === "approve") {
    await db.update(businessesTable).set({
      isSuspended: false,
      status: "approved",
    }).where(eq(businessesTable.id, reqRow.businessId));
  }

  return res.json({ ok: true, action });
});

export default router;
