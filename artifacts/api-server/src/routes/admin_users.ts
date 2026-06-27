import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, businessesTable, reviewsTable, enquiriesTable, leadsTable, leadAssignmentsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { UpdateUserRoleBody, UpdateUserRoleParams, RegisterUserBody } from "@workspace/api-zod";
import { generateId, hashPassword } from "../lib/auth";
import { requireAdminAuth } from "../middlewares/adminAuth";

const router = Router();

router.get("/by-email", async (req, res) => {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ error: "email required" });
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json({ ...user, createdAt: user.createdAt?.toISOString() });
});

router.get("/", async (_req, res) => {
  const rows = await db.select().from(usersTable)
    .where(eq(usersTable.isDeleted, false))
    .orderBy(usersTable.createdAt);
  return res.json(rows.map((u) => ({ ...u, createdAt: u.createdAt?.toISOString() })));
});

router.post("/", async (req, res) => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { email, name, role } = parsed.data;
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    return res.json({ ...existing[0], createdAt: existing[0].createdAt?.toISOString() });
  }
  const [user] = await db.insert(usersTable).values({
    id: generateId(),
    email,
    name: name ?? null,
    role: role ?? "business_owner",
  }).returning();
  return res.status(201).json({ ...user, createdAt: user.createdAt?.toISOString() });
});

router.patch("/:id/role", async (req, res) => {
  const p = UpdateUserRoleParams.safeParse(req.params);
  const body = UpdateUserRoleBody.safeParse(req.body);
  if (!p.success || !body.success) return res.status(400).json({ error: "Invalid input" });
  const [user] = await db.update(usersTable).set({ role: body.data.role }).where(eq(usersTable.id, p.data.id)).returning();
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json({ ...user, createdAt: user.createdAt?.toISOString() });
});

router.patch("/:id/suspend", async (req, res) => {
  const { suspended } = req.body;
  const [user] = await db.update(usersTable)
    .set({ isSuspended: !!suspended })
    .where(eq(usersTable.id, req.params.id))
    .returning();
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json({ ...user, createdAt: user.createdAt?.toISOString() });
});

router.delete("/:id", async (req, res) => {
  const userId = req.params.id;
  const hardDelete = req.query.hard === "true";
  if (hardDelete) {
    // Cascade: delete all businesses owned by this user first, then related data
    const ownedBusinesses = await db.select({ id: businessesTable.id })
      .from(businessesTable)
      .where(eq(businessesTable.ownerId, userId));
    if (ownedBusinesses.length > 0) {
      const bizIds = ownedBusinesses.map(b => b.id);
      await db.delete(reviewsTable).where(inArray(reviewsTable.businessId, bizIds));
      await db.delete(enquiriesTable).where(inArray(enquiriesTable.businessId, bizIds));
      const assignedLeads = await db.select({ leadId: leadAssignmentsTable.leadId })
        .from(leadAssignmentsTable)
        .where(inArray(leadAssignmentsTable.businessId, bizIds));
      if (assignedLeads.length > 0) {
        await db.delete(leadAssignmentsTable).where(inArray(leadAssignmentsTable.businessId, bizIds));
      }
      await db.delete(businessesTable).where(inArray(businessesTable.id, bizIds));
    }
    await db.delete(usersTable).where(eq(usersTable.id, userId));
  } else {
    await db.update(usersTable).set({ isDeleted: true }).where(eq(usersTable.id, userId));
  }
  return res.status(204).send();
});

router.patch("/:id/reset-password", requireAdminAuth, async (req, res) => {
  const { password } = req.body;
  if (!password || typeof password !== "string" || password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  const passwordHash = await hashPassword(password);
  const [user] = await db.update(usersTable)
    .set({ passwordHash, resetToken: null, resetTokenExpiresAt: null })
    .where(eq(usersTable.id, String(req.params.id)))
    .returning();
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json({ ok: true });
});

export default router;
