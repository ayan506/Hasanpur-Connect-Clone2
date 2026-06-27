import { Router } from "express";
import { db } from "@workspace/db";
import {
  analyticsEventsTable, businessesTable, reviewsTable, enquiriesTable,
  productsTable, blogPostsTable, categoriesTable, usersTable, leadsTable,
  searchQueriesTable, leadAssignmentsTable,
} from "@workspace/db";
import { eq, and, sql, desc, gte, lte } from "drizzle-orm";
import { TrackEventBody, GetBusinessAnalyticsParams } from "@workspace/api-zod";
import { checkViewMilestones } from "../email/milestones";

const router = Router();

router.post("/track", async (req, res) => {
  const parsed = TrackEventBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  await db.insert(analyticsEventsTable).values({
    eventType: parsed.data.eventType,
    entityId: parsed.data.entityId ?? null,
    entityType: parsed.data.entityType ?? null,
    metadataJson: parsed.data.metadata ? JSON.stringify(parsed.data.metadata) : null,
  });
  if (parsed.data.entityType === "business" && parsed.data.entityId) {
    if (parsed.data.eventType === "view") {
      await db.update(businessesTable)
        .set({ viewCount: sql`${businessesTable.viewCount} + 1` })
        .where(eq(businessesTable.id, parsed.data.entityId));
      checkViewMilestones(Number(parsed.data.entityId)).catch(() => {});
    }
  }
  return res.status(201).json({ ok: true });
});

router.get("/summary", async (_req, res) => {
  const [{ total: totalBusinesses }] = await db.select({ total: sql<number>`count(*)::int` }).from(businessesTable);
  const [{ total: premiumBusinesses }] = await db.select({ total: sql<number>`count(*)::int` }).from(businessesTable).where(eq(businessesTable.isPremium, true));
  const [{ total: verifiedBusinesses }] = await db.select({ total: sql<number>`count(*)::int` }).from(businessesTable).where(eq(businessesTable.isVerified, true));
  const [{ total: pendingBusinesses }] = await db.select({ total: sql<number>`count(*)::int` }).from(businessesTable).where(eq(businessesTable.status, "pending"));
  const [{ total: totalReviews }] = await db.select({ total: sql<number>`count(*)::int` }).from(reviewsTable);
  const [{ total: totalEnquiries }] = await db.select({ total: sql<number>`count(*)::int` }).from(enquiriesTable);
  const [{ total: totalProducts }] = await db.select({ total: sql<number>`count(*)::int` }).from(productsTable);
  const [{ total: totalBlogPosts }] = await db.select({ total: sql<number>`count(*)::int` }).from(blogPostsTable);

  const catStats = await db.select({
    categoryId: businessesTable.categoryId,
    count: sql<number>`count(*)::int`,
  }).from(businessesTable).where(eq(businessesTable.status, "approved")).groupBy(businessesTable.categoryId).orderBy(sql`count(*) desc`).limit(5);
  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map((c) => [c.id, c.name]));
  const topCategories = catStats.map((s) => ({ categoryId: s.categoryId, categoryName: catMap.get(s.categoryId) ?? "", count: s.count }));

  const mostViewed = await db.select().from(businessesTable).where(eq(businessesTable.status, "approved")).orderBy(desc(businessesTable.viewCount)).limit(5);

  const recentEvents = await db.select().from(analyticsEventsTable).orderBy(desc(analyticsEventsTable.createdAt)).limit(10);

  const dailyVisits = await db.execute(sql`
    SELECT DATE(created_at) as date, count(*)::int as count
    FROM analytics_events
    WHERE event_type = 'page_view' AND created_at >= NOW() - INTERVAL '7 days'
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `);

  const [{ total: totalViews }] = await db.select({ total: sql<number>`coalesce(sum(view_count),0)::int` }).from(businessesTable);
  const [{ total: totalViewEvents }] = await db.select({ total: sql<number>`count(*)::int` }).from(analyticsEventsTable);
  const [{ total: totalUsers }] = await db.select({ total: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.isDeleted, false));
  const [{ total: approvedBusinesses }] = await db.select({ total: sql<number>`count(*)::int` }).from(businessesTable).where(eq(businessesTable.status, "approved"));
  const [{ total: totalLeads }] = await db.select({ total: sql<number>`count(*)::int` }).from(leadsTable);

  const clickEvents = await db.select({ eventType: analyticsEventsTable.eventType, total: sql<number>`count(*)::int` })
    .from(analyticsEventsTable)
    .where(sql`event_type IN ('whatsapp_click','call_click')`)
    .groupBy(analyticsEventsTable.eventType);
  const clickMap = new Map(clickEvents.map(e => [e.eventType, e.total]));
  const whatsappClicks = clickMap.get("whatsapp_click") ?? 0;
  const callClicks = clickMap.get("call_click") ?? 0;

  return res.json({
    totalBusinesses, premiumBusinesses, verifiedBusinesses, pendingBusinesses, approvedBusinesses,
    totalUsers, totalViews, totalViewEvents,
    totalLeads, whatsappClicks, callClicks,
    totalReviews, totalEnquiries, totalProducts, totalBlogPosts,
    topCategories,
    mostViewedBusinesses: mostViewed.map((b) => ({
      id: b.id, name: b.name, slug: b.slug, categoryId: b.categoryId, categoryName: catMap.get(b.categoryId) ?? "",
      status: b.status, isPremium: b.isPremium, isVerified: b.isVerified,
      viewCount: b.viewCount, reviewCount: 0, averageRating: null,
      createdAt: b.createdAt?.toISOString(),
    })),
    recentActivity: recentEvents.map((e) => ({
      type: e.eventType,
      message: `${e.eventType} on ${e.entityType ?? "platform"}`,
      createdAt: e.createdAt?.toISOString(),
    })),
    dailyVisits: (dailyVisits.rows as any[]).map((r) => ({ date: r.date, count: r.count })),
  });
});

router.get("/advanced", async (req, res) => {
  const { from, to, range } = req.query as { from?: string; to?: string; range?: string };

  let fromDate: Date;
  let toDate = new Date();

  if (from && to) {
    fromDate = new Date(from);
    toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
  } else {
    switch (range) {
      case "today":
        fromDate = new Date(); fromDate.setHours(0, 0, 0, 0); break;
      case "yesterday":
        fromDate = new Date(); fromDate.setDate(fromDate.getDate() - 1); fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(); toDate.setDate(toDate.getDate() - 1); toDate.setHours(23, 59, 59, 999); break;
      case "last_week":
        fromDate = new Date(); fromDate.setDate(fromDate.getDate() - 14); break;
      case "this_month":
        fromDate = new Date(); fromDate.setDate(1); fromDate.setHours(0, 0, 0, 0); break;
      case "last_month":
        fromDate = new Date(); fromDate.setMonth(fromDate.getMonth() - 1); fromDate.setDate(1); fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(); toDate.setDate(0); toDate.setHours(23, 59, 59, 999); break;
      default:
        fromDate = new Date(); fromDate.setDate(fromDate.getDate() - 7);
    }
  }

  const fromISO = fromDate.toISOString();
  const toISO = toDate.toISOString();

  const [todayStart] = [new Date()];
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

  const todayViews = await db.execute(sql`
    SELECT count(*)::int as count FROM analytics_events
    WHERE event_type = 'page_view' AND created_at >= ${todayStart.toISOString()}
  `);
  const weekViews = await db.execute(sql`
    SELECT count(*)::int as count FROM analytics_events
    WHERE event_type = 'page_view' AND created_at >= ${weekStart.toISOString()}
  `);
  const monthViews = await db.execute(sql`
    SELECT count(*)::int as count FROM analytics_events
    WHERE event_type = 'page_view' AND created_at >= ${monthStart.toISOString()}
  `);
  const totalPageViews = await db.execute(sql`
    SELECT count(*)::int as count FROM analytics_events WHERE event_type = 'page_view'
  `);

  const trafficSummary = {
    today: (todayViews.rows[0] as any)?.count ?? 0,
    thisWeek: (weekViews.rows[0] as any)?.count ?? 0,
    thisMonth: (monthViews.rows[0] as any)?.count ?? 0,
    total: (totalPageViews.rows[0] as any)?.count ?? 0,
  };

  const dailyVisitsResult = await db.execute(sql`
    SELECT DATE(created_at) as date, count(*)::int as count
    FROM analytics_events
    WHERE event_type = 'page_view'
      AND created_at >= ${fromISO}
      AND created_at <= ${toISO}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `);
  const dailyVisits = (dailyVisitsResult.rows as any[]).map(r => ({
    date: new Date(r.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    views: Number(r.count),
  }));

  const peakHoursResult = await db.execute(sql`
    SELECT EXTRACT(hour FROM created_at)::int as hour, count(*)::int as count
    FROM analytics_events
    WHERE event_type = 'page_view'
      AND created_at >= ${fromISO} AND created_at <= ${toISO}
    GROUP BY hour ORDER BY hour ASC
  `);
  const peakHoursMap = new Map((peakHoursResult.rows as any[]).map(r => [Number(r.hour), Number(r.count)]));
  const peakHours = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h.toString().padStart(2, "0")}:00`,
    count: peakHoursMap.get(h) ?? 0,
  }));

  const peakDaysResult = await db.execute(sql`
    SELECT EXTRACT(dow FROM created_at)::int as day, count(*)::int as count
    FROM analytics_events
    WHERE event_type = 'page_view'
      AND created_at >= ${fromISO} AND created_at <= ${toISO}
    GROUP BY day ORDER BY day ASC
  `);
  const peakDaysMap = new Map((peakDaysResult.rows as any[]).map(r => [Number(r.day), Number(r.count)]));
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const peakDays = dayNames.map((name, i) => ({ day: name, count: peakDaysMap.get(i) ?? 0 }));

  const deviceResult = await db.execute(sql`
    SELECT
      CASE
        WHEN metadata_json::text ILIKE '%mobile%' THEN 'Mobile'
        WHEN metadata_json::text ILIKE '%tablet%' THEN 'Tablet'
        WHEN metadata_json::text ILIKE '%desktop%' THEN 'Desktop'
        ELSE 'Other'
      END as device,
      count(*)::int as count
    FROM analytics_events
    WHERE event_type = 'page_view'
      AND created_at >= ${fromISO} AND created_at <= ${toISO}
    GROUP BY device
  `);
  const deviceBreakdown = (deviceResult.rows as any[]).map(r => ({
    device: r.device as string,
    count: Number(r.count),
  }));

  const topPagesResult = await db.execute(sql`
    SELECT
      COALESCE(metadata_json::json->>'path', 'unknown') as path,
      count(*)::int as count
    FROM analytics_events
    WHERE event_type = 'page_view'
      AND created_at >= ${fromISO} AND created_at <= ${toISO}
      AND metadata_json IS NOT NULL
    GROUP BY path ORDER BY count DESC LIMIT 10
  `);
  const topPages = (topPagesResult.rows as any[]).map(r => ({
    path: r.path as string,
    count: Number(r.count),
  }));

  const prevWeekStart = new Date(); prevWeekStart.setDate(prevWeekStart.getDate() - 14);
  const currWeekStart = new Date(); currWeekStart.setDate(currWeekStart.getDate() - 7);

  const growthResult = await db.execute(sql`
    SELECT
      entity_id,
      SUM(CASE WHEN created_at >= ${currWeekStart.toISOString()} THEN 1 ELSE 0 END)::int as current_week,
      SUM(CASE WHEN created_at >= ${prevWeekStart.toISOString()} AND created_at < ${currWeekStart.toISOString()} THEN 1 ELSE 0 END)::int as prev_week
    FROM analytics_events
    WHERE event_type = 'view' AND entity_type = 'business'
    GROUP BY entity_id
    HAVING SUM(CASE WHEN created_at >= ${currWeekStart.toISOString()} THEN 1 ELSE 0 END) > 0
    ORDER BY current_week DESC
    LIMIT 10
  `);
  const growthRows = (growthResult.rows as any[]);
  const bizIds = growthRows.map(r => Number(r.entity_id)).filter(Boolean);
  let fastestGrowing: any[] = [];
  if (bizIds.length > 0) {
    const bizDetails = await db.select({ id: businessesTable.id, name: businessesTable.name, slug: businessesTable.slug })
      .from(businessesTable)
      .where(sql`${businessesTable.id} = ANY(${bizIds})`);
    const bizMap = new Map(bizDetails.map(b => [b.id, b]));
    fastestGrowing = growthRows
      .map(r => {
        const biz = bizMap.get(Number(r.entity_id));
        if (!biz) return null;
        const curr = Number(r.current_week);
        const prev = Number(r.prev_week);
        const growth = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : (curr > 0 ? 100 : 0);
        return { id: biz.id, name: biz.name, slug: biz.slug, currentWeek: curr, prevWeek: prev, growth };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.growth - a.growth)
      .slice(0, 5);
  }

  const cats = await db.select().from(categoriesTable);
  const catStats = await Promise.all(cats.map(async (cat) => {
    const [{ total: bizCount }] = await db.select({ total: sql<number>`count(*)::int` }).from(businessesTable).where(and(eq(businessesTable.categoryId, cat.id), eq(businessesTable.status, "approved")));
    const [{ total: leadCount }] = await db.select({ total: sql<number>`count(*)::int` }).from(leadsTable).where(eq(leadsTable.categoryId, cat.id));
    const bizIdsInCat = (await db.select({ id: businessesTable.id }).from(businessesTable).where(eq(businessesTable.categoryId, cat.id))).map(b => b.id);
    let reviewCount = 0;
    let enquiryCount = 0;
    let viewCount = 0;
    if (bizIdsInCat.length > 0) {
      const [{ total: rc }] = await db.execute(sql`SELECT count(*)::int as total FROM reviews WHERE business_id = ANY(${bizIdsInCat})`).then(r => r.rows as any[]);
      const [{ total: ec }] = await db.execute(sql`SELECT count(*)::int as total FROM enquiries WHERE business_id = ANY(${bizIdsInCat})`).then(r => r.rows as any[]);
      const [{ total: vc }] = await db.execute(sql`SELECT coalesce(sum(view_count),0)::int as total FROM businesses WHERE id = ANY(${bizIdsInCat})`).then(r => r.rows as any[]);
      reviewCount = Number(rc ?? 0);
      enquiryCount = Number(ec ?? 0);
      viewCount = Number(vc ?? 0);
    }
    return { categoryId: cat.id, categoryName: cat.name, icon: cat.icon, businesses: bizCount, leads: leadCount, reviews: reviewCount, enquiries: enquiryCount, views: viewCount };
  }));

  const [{ total: totalSearches }] = await db.select({ total: sql<number>`count(*)::int` }).from(searchQueriesTable);
  const [{ total: zeroResultsCount }] = await db.select({ total: sql<number>`count(*)::int` }).from(searchQueriesTable).where(eq(searchQueriesTable.resultsCount, 0));

  const topKeywordsResult = await db
    .select({ query: searchQueriesTable.query, count: sql<number>`count(*)::int` })
    .from(searchQueriesTable)
    .where(sql`results_count > 0`)
    .groupBy(searchQueriesTable.query)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  const zeroResultKeywordsResult = await db
    .select({ query: searchQueriesTable.query, count: sql<number>`count(*)::int` })
    .from(searchQueriesTable)
    .where(eq(searchQueriesTable.resultsCount, 0))
    .groupBy(searchQueriesTable.query)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  const mostEnquired = await db.select({
    id: businessesTable.id, name: businessesTable.name, slug: businessesTable.slug,
    count: sql<number>`count(enquiries.id)::int`,
  }).from(businessesTable).leftJoin(enquiriesTable, eq(enquiriesTable.businessId, businessesTable.id))
    .where(eq(businessesTable.status, "approved"))
    .groupBy(businessesTable.id).orderBy(sql`count(enquiries.id) desc`).limit(10);

  const mostReviewed = await db.select({
    id: businessesTable.id, name: businessesTable.name, slug: businessesTable.slug,
    count: sql<number>`count(reviews.id)::int`,
  }).from(businessesTable).leftJoin(reviewsTable, eq(reviewsTable.businessId, businessesTable.id))
    .where(eq(businessesTable.status, "approved"))
    .groupBy(businessesTable.id).orderBy(sql`count(reviews.id) desc`).limit(10);

  const mostViewedResult = await db.select({
    id: businessesTable.id, name: businessesTable.name, slug: businessesTable.slug, viewCount: businessesTable.viewCount,
  }).from(businessesTable).where(eq(businessesTable.status, "approved")).orderBy(desc(businessesTable.viewCount)).limit(10);

  return res.json({
    trafficSummary,
    dailyVisits,
    peakHours,
    peakDays,
    deviceBreakdown,
    topPages,
    fastestGrowing,
    categoryStats: catStats.filter(c => c.businesses > 0 || c.leads > 0 || c.views > 0),
    searchStats: {
      total: Number(totalSearches),
      zeroResults: Number(zeroResultsCount),
      topKeywords: topKeywordsResult.map(r => ({ query: r.query, count: r.count })),
      zeroResultKeywords: zeroResultKeywordsResult.map(r => ({ query: r.query, count: r.count })),
    },
    businessStats: {
      mostViewed: mostViewedResult,
      mostEnquired: mostEnquired.map(b => ({ ...b, count: b.count })),
      mostReviewed: mostReviewed.map(b => ({ ...b, count: b.count })),
    },
  });
});

router.get("/business/:id", async (req, res) => {
  const p = GetBusinessAnalyticsParams.safeParse(req.params);
  if (!p.success) return res.status(404).json({ error: "Invalid" });
  const id = p.data.id;
  const [b] = await db.select().from(businessesTable).where(eq(businessesTable.id, id));
  if (!b) return res.status(404).json({ error: "Not found" });
  const reviews = await db.select({ rating: reviewsTable.rating }).from(reviewsTable).where(and(eq(reviewsTable.businessId, id), eq(reviewsTable.status, "approved")));
  const [{ total: enquiryCount }] = await db.select({ total: sql<number>`count(*)::int` }).from(enquiriesTable).where(eq(enquiriesTable.businessId, id));
  const [{ total: productViews }] = await db.select({ total: sql<number>`coalesce(sum(view_count),0)::int` }).from(productsTable).where(eq(productsTable.businessId, id));

  const events = await db.select({ eventType: analyticsEventsTable.eventType, total: sql<number>`count(*)::int` })
    .from(analyticsEventsTable)
    .where(and(eq(analyticsEventsTable.entityId, id), eq(analyticsEventsTable.entityType, "business")))
    .groupBy(analyticsEventsTable.eventType);
  const eventMap = new Map(events.map((e) => [e.eventType, e.total]));
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

  const dailyResult = await db.execute(sql`
    SELECT DATE(created_at) as date, count(*)::int as count
    FROM analytics_events
    WHERE entity_id = ${id} AND entity_type = 'business' AND event_type = 'view'
      AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at) ORDER BY date ASC
  `);

  return res.json({
    businessId: id,
    profileViews: b.viewCount,
    whatsappClicks: eventMap.get("whatsapp_click") ?? 0,
    callClicks: eventMap.get("call_click") ?? 0,
    websiteClicks: eventMap.get("website_click") ?? 0,
    enquiryCount,
    reviewCount: reviews.length,
    productViews,
    averageRating: avgRating,
    dailyViews: (dailyResult.rows as any[]).map(r => ({
      date: new Date(r.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      views: Number(r.count),
    })),
  });
});

export default router;
