import { Router } from "express";
import { db } from "@workspace/db";
import { communityPartnersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdminAuth } from "../middlewares/adminAuth";

const router = Router();

router.get("/", async (_req, res) => {
  const partners = await db.select().from(communityPartnersTable)
    .where(eq(communityPartnersTable.isActive, true))
    .orderBy(asc(communityPartnersTable.sortOrder));
  return res.json(partners.map((p) => ({ ...p, joinedSince: p.joinedSince?.toISOString(), createdAt: p.createdAt?.toISOString() })));
});

router.get("/all", requireAdminAuth, async (_req, res) => {
  const partners = await db.select().from(communityPartnersTable)
    .orderBy(asc(communityPartnersTable.sortOrder));
  return res.json(partners.map((p) => ({ ...p, joinedSince: p.joinedSince?.toISOString(), createdAt: p.createdAt?.toISOString() })));
});

router.post("/", requireAdminAuth, async (req, res) => {
  const { name, about, photoUrl, badge, socialLinksJson, totalReferrals, totalVisitorsSent, joinedSince, sortOrder, isActive } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  const [partner] = await db.insert(communityPartnersTable).values({
    name, about, photoUrl, badge,
    socialLinksJson: socialLinksJson ? (typeof socialLinksJson === "string" ? socialLinksJson : JSON.stringify(socialLinksJson)) : null,
    totalReferrals: totalReferrals ?? 0,
    totalVisitorsSent: totalVisitorsSent ?? 0,
    joinedSince: joinedSince ? new Date(joinedSince) : null,
    sortOrder: sortOrder ?? 0,
    isActive: isActive !== false,
  }).returning();
  return res.status(201).json({ ...partner, joinedSince: partner.joinedSince?.toISOString(), createdAt: partner.createdAt?.toISOString() });
});

router.put("/:id", requireAdminAuth, async (req, res) => {
  const updates: any = {};
  const fields = ["name", "about", "photoUrl", "badge", "totalReferrals", "totalVisitorsSent", "sortOrder", "isActive"];
  fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  if (req.body.joinedSince !== undefined) updates.joinedSince = req.body.joinedSince ? new Date(req.body.joinedSince) : null;
  if (req.body.socialLinksJson !== undefined) updates.socialLinksJson = typeof req.body.socialLinksJson === "string" ? req.body.socialLinksJson : JSON.stringify(req.body.socialLinksJson);
  const [partner] = await db.update(communityPartnersTable).set(updates).where(eq(communityPartnersTable.id, Number(req.params.id))).returning();
  if (!partner) return res.status(404).json({ error: "Not found" });
  return res.json({ ...partner, joinedSince: partner.joinedSince?.toISOString(), createdAt: partner.createdAt?.toISOString() });
});

router.delete("/:id", requireAdminAuth, async (req, res) => {
  await db.delete(communityPartnersTable).where(eq(communityPartnersTable.id, Number(req.params.id)));
  return res.status(204).send();
});

export default router;
