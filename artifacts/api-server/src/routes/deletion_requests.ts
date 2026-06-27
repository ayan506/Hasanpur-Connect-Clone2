import { Router } from "express";
import { db } from "@workspace/db";
import { deletionRequestsTable, adminNotificationsTable, usersTable, businessesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAdminAuth } from "../middlewares/adminAuth";

const router = Router();

router.post("/", async (req, res) => {
  const { type, email, businessId, reason } = req.body;
  if (!email) return res.status(400).json({ error: "email required" });
  if (!["account", "listing"].includes(type)) return res.status(400).json({ error: "type must be account or listing" });
  if (type === "listing" && !businessId) return res.status(400).json({ error: "businessId required for listing deletion" });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) return res.status(404).json({ error: "Account not found" });

  const existing = await db.select().from(deletionRequestsTable)
    .where(and(eq(deletionRequestsTable.userId, user.id), eq(deletionRequestsTable.status, "pending")));
  const alreadyPending = existing.find(r => r.type === type && (type === "account" || r.businessId === Number(businessId)));
  if (alreadyPending) return res.status(409).json({ error: "A pending deletion request already exists" });

  const [request] = await db.insert(deletionRequestsTable).values({
    type,
    userId: user.id,
    businessId: businessId ? Number(businessId) : null,
    reason: reason || null,
    status: "pending",
  }).returning();

  let businessName = "";
  if (type === "listing" && businessId) {
    const [biz] = await db.select({ name: businessesTable.name }).from(businessesTable).where(eq(businessesTable.id, Number(businessId)));
    businessName = biz?.name ?? `#${businessId}`;
  }

  await db.insert(adminNotificationsTable).values({
    type: type === "account" ? "account_deletion_request" : "listing_deletion_request",
    title: type === "account" ? "Account Deletion Request" : "Listing Deletion Request",
    message: type === "account"
      ? `${user.name || user.email} has requested account deletion.${reason ? ` Reason: ${reason}` : ""}`
      : `${user.name || user.email} has requested deletion of listing "${businessName}".${reason ? ` Reason: ${reason}` : ""}`,
    entityId: request.id,
    entityType: "deletion_request",
    isRead: false,
  });

  return res.status(201).json({ ...request, createdAt: request.createdAt?.toISOString() });
});

router.get("/my", async (req, res) => {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ error: "email required" });
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) return res.json([]);
  const requests = await db.select().from(deletionRequestsTable)
    .where(eq(deletionRequestsTable.userId, user.id))
    .orderBy(desc(deletionRequestsTable.createdAt));
  return res.json(requests.map(r => ({ ...r, createdAt: r.createdAt?.toISOString(), reviewedAt: r.reviewedAt?.toISOString() ?? null })));
});

router.get("/", requireAdminAuth, async (_req, res) => {
  const requests = await db.select().from(deletionRequestsTable).orderBy(desc(deletionRequestsTable.createdAt));
  const users = await db.select({ id: usersTable.id, email: usersTable.email, name: usersTable.name }).from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u]));
  const businesses = await db.select({ id: businessesTable.id, name: businessesTable.name }).from(businessesTable);
  const bizMap = new Map(businesses.map(b => [b.id, b.name]));
  return res.json(requests.map(r => ({
    ...r,
    userEmail: userMap.get(r.userId)?.email ?? null,
    userName: userMap.get(r.userId)?.name ?? null,
    businessName: r.businessId ? bizMap.get(r.businessId) ?? null : null,
    createdAt: r.createdAt?.toISOString(),
    reviewedAt: r.reviewedAt?.toISOString() ?? null,
  })));
});

router.patch("/:id/review", requireAdminAuth, async (req, res) => {
  const { status, adminNotes } = req.body;
  if (!["approved", "rejected"].includes(status)) return res.status(400).json({ error: "status must be approved or rejected" });

  const [request] = await db.select().from(deletionRequestsTable).where(eq(deletionRequestsTable.id, Number(req.params.id)));
  if (!request) return res.status(404).json({ error: "Not found" });

  const [updated] = await db.update(deletionRequestsTable)
    .set({ status, adminNotes: adminNotes || null, reviewedAt: new Date() })
    .where(eq(deletionRequestsTable.id, Number(req.params.id)))
    .returning();

  if (status === "approved") {
    if (request.type === "account") {
      await db.update(usersTable).set({ isDeleted: true }).where(eq(usersTable.id, request.userId));
      await db.update(businessesTable).set({ status: "rejected" }).where(eq(businessesTable.ownerId, request.userId));
    } else if (request.type === "listing" && request.businessId) {
      await db.update(businessesTable).set({ status: "rejected" }).where(eq(businessesTable.id, request.businessId));
    }
  }

  await db.update(adminNotificationsTable)
    .set({ isRead: true })
    .where(and(eq(adminNotificationsTable.entityId, request.id), eq(adminNotificationsTable.entityType, "deletion_request")));

  return res.json({ ...updated, createdAt: updated.createdAt?.toISOString(), reviewedAt: updated.reviewedAt?.toISOString() ?? null });
});

export default router;
