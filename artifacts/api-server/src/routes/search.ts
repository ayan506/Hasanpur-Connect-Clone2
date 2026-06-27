import { Router } from "express";
import { db } from "@workspace/db";
import { businessesTable, categoriesTable, searchQueriesTable } from "@workspace/db";
import { eq, ilike, or, and, desc, sql } from "drizzle-orm";
import { SearchQueryParams } from "@workspace/api-zod";

const router = Router();

function serializeBiz(b: any, catMap: Map<number, string>) {
  return {
    id: b.id, name: b.name, slug: b.slug, categoryId: b.categoryId,
    categoryName: catMap.get(b.categoryId) ?? "",
    description: b.description, address: b.address, phone: b.phone,
    whatsapp: b.whatsapp, email: b.email, website: b.website,
    logo: b.logo, coverImage: b.coverImage, status: b.status,
    isPremium: b.isPremium, isVerified: b.isVerified, isFeatured: b.isFeatured,
    rankingScore: b.rankingScore ?? 0, viewCount: b.viewCount ?? 0,
    customBadge: b.customBadge ?? null, customBadgeColor: b.customBadgeColor ?? null,
    averageRating: null, reviewCount: 0,
    createdAt: b.createdAt?.toISOString(),
  };
}

router.get("/autocomplete", async (req, res) => {
  const { q } = req.query as { q?: string };
  if (!q || q.length < 2) return res.json([]);
  const rows = await db.select({
    id: businessesTable.id, name: businessesTable.name,
    slug: businessesTable.slug, categoryId: businessesTable.categoryId,
    logo: businessesTable.logo, address: businessesTable.address,
  }).from(businessesTable)
    .where(and(
      eq(businessesTable.status, "approved"),
      eq(businessesTable.isSuspended, false),
      or(ilike(businessesTable.name, `%${q}%`), ilike(businessesTable.address, `%${q}%`)),
    ))
    .orderBy(desc(businessesTable.rankingScore), desc(businessesTable.viewCount))
    .limit(8);
  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  return res.json(rows.map(b => ({
    id: b.id, name: b.name, slug: b.slug,
    categoryName: catMap.get(b.categoryId) ?? "", logo: b.logo,
  })));
});

router.get("/", async (req, res) => {
  const parsed = SearchQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query" });
  const { q, category } = parsed.data;
  if (!q || q.trim().length < 2) {
    return res.json({ businesses: [], total: 0, query: q });
  }

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map((c) => [c.id, c.name]));

  const numericId = q.replace(/^HC-?0*/i, "").trim();
  if (/^\d+$/.test(numericId)) {
    const byId = await db.select().from(businessesTable).where(eq(businessesTable.id, Number(numericId))).limit(1);
    if (byId.length > 0) {
      return res.json({ businesses: byId.map(b => serializeBiz(b, catMap)), total: byId.length, query: q });
    }
  }

  const conditions: any[] = [
    eq(businessesTable.status, "approved"),
    eq(businessesTable.isSuspended, false),
    or(
      ilike(businessesTable.name, `%${q}%`),
      ilike(businessesTable.description, `%${q}%`),
      ilike(businessesTable.address, `%${q}%`),
    ),
  ];
  if (category) {
    const matched = cats.find(c => c.slug === category);
    if (matched) conditions.push(eq(businessesTable.categoryId, matched.id));
  }

  const rows = await db.select().from(businessesTable).where(and(...conditions))
    .orderBy(
      desc(businessesTable.isPremium),
      desc(businessesTable.isVerified),
      desc(businessesTable.isFeatured),
      desc(businessesTable.rankingScore),
      desc(businessesTable.viewCount),
    )
    .limit(50);

  const businesses = rows.map(b => serializeBiz(b, catMap));

  try {
    await db.insert(searchQueriesTable).values({
      query: q, resultsCount: businesses.length,
      sessionId: req.headers["x-session-id"] as string || null,
    });
  } catch { }

  return res.json({ businesses, total: businesses.length, query: q });
});

router.get("/analytics", async (_req, res) => {
  const topQueries = await db
    .select({ query: searchQueriesTable.query, count: sql<number>`count(*)::int` })
    .from(searchQueriesTable).groupBy(searchQueriesTable.query)
    .orderBy(desc(sql`count(*)`)).limit(20);
  const zeroResults = await db
    .select({ query: searchQueriesTable.query, count: sql<number>`count(*)::int` })
    .from(searchQueriesTable).where(eq(searchQueriesTable.resultsCount, 0))
    .groupBy(searchQueriesTable.query).orderBy(desc(sql`count(*)`)).limit(20);
  return res.json({ topQueries, zeroResults });
});

export default router;
