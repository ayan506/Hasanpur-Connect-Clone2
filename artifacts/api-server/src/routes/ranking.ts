import { Router } from "express";
import { db } from "@workspace/db";
import { businessesTable, categoryRankingHistoryTable, analyticsEventsTable, enquiriesTable, reviewsTable } from "@workspace/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { requireAdminAuth } from "../middlewares/adminAuth";

const router = Router();

export async function updateAllRankingScores(): Promise<void> {
  const businesses = await db.select({
    id: businessesTable.id,
    categoryId: businessesTable.categoryId,
    viewCount: businessesTable.viewCount,
  }).from(businessesTable).where(eq(businessesTable.status, "approved"));

  for (const biz of businesses) {
    const [{ total: enquiryCount }] = await db.select({ total: sql<number>`count(*)::int` })
      .from(enquiriesTable).where(eq(enquiriesTable.businessId, biz.id));
    const events = await db.select({ eventType: analyticsEventsTable.eventType, total: sql<number>`count(*)::int` })
      .from(analyticsEventsTable)
      .where(and(eq(analyticsEventsTable.entityId, biz.id), eq(analyticsEventsTable.entityType, "business")))
      .groupBy(analyticsEventsTable.eventType);
    const evMap = new Map(events.map(e => [e.eventType, e.total]));
    const score = (biz.viewCount ?? 0) * 1
      + (Number(enquiryCount) ?? 0) * 10
      + (evMap.get("whatsapp_click") ?? 0) * 5
      + (evMap.get("call_click") ?? 0) * 5
      + (evMap.get("website_click") ?? 0) * 3;

    await db.update(businessesTable).set({ rankingScore: score }).where(eq(businessesTable.id, biz.id));
  }

  const categories = [...new Set(businesses.map(b => b.categoryId))];
  for (const catId of categories) {
    const catBizs = await db.select({ id: businessesTable.id, rankingScore: businessesTable.rankingScore })
      .from(businessesTable)
      .where(and(eq(businessesTable.categoryId, catId), eq(businessesTable.status, "approved")))
      .orderBy(desc(businessesTable.rankingScore));
    for (let i = 0; i < catBizs.length; i++) {
      await db.insert(categoryRankingHistoryTable).values({
        businessId: catBizs[i].id,
        categoryId: catId,
        rank: i + 1,
        score: catBizs[i].rankingScore ?? 0,
      }).catch(() => {});
    }
  }
}

router.post("/update", requireAdminAuth, async (_req, res) => {
  await updateAllRankingScores();
  return res.json({ ok: true, message: "Ranking scores updated" });
});

router.get("/category/:categoryId", async (req, res) => {
  const catId = parseInt(req.params.categoryId);
  if (isNaN(catId)) return res.status(400).json({ error: "Invalid categoryId" });
  const businesses = await db.select({
    id: businessesTable.id,
    name: businessesTable.name,
    slug: businessesTable.slug,
    rankingScore: businessesTable.rankingScore,
    viewCount: businessesTable.viewCount,
    isPremium: businessesTable.isPremium,
    isVerified: businessesTable.isVerified,
    isFeatured: businessesTable.isFeatured,
  }).from(businessesTable)
    .where(and(eq(businessesTable.categoryId, catId), eq(businessesTable.status, "approved"), eq(businessesTable.isSuspended, false)))
    .orderBy(desc(businessesTable.rankingScore));
  return res.json(businesses.map((b, i) => ({ ...b, rank: i + 1 })));
});

router.get("/business/:id/history", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const history = await db.select().from(categoryRankingHistoryTable)
    .where(eq(categoryRankingHistoryTable.businessId, id))
    .orderBy(desc(categoryRankingHistoryTable.recordedAt))
    .limit(30);
  return res.json(history.map(h => ({ ...h, recordedAt: h.recordedAt?.toISOString() ?? null })));
});

export default router;
