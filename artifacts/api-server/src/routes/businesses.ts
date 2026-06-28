import { Router } from "express";
import { db } from "@workspace/db";
import {
  businessesTable,
  categoriesTable,
  reviewsTable,
  enquiriesTable,
  productsTable,
  analyticsEventsTable,
  siteSettingsTable,
  adminNotificationsTable,
  businessEditHistoryTable,
} from "@workspace/db";
import { eq, and, or, ilike, desc, sql, inArray } from "drizzle-orm";
import {
  CreateBusinessBody,
  UpdateBusinessBody,
  UpdateBusinessParams,
  UpdateBusinessStatusBody,
  UpdateBusinessStatusParams,
  DeleteBusinessParams,
  GetBusinessParams,
  ListBusinessesQueryParams,
} from "@workspace/api-zod";
import { requireAdminAuth } from "../middlewares/adminAuth";
import { sendEmail } from "../email/send-email";
import crypto from "crypto";

const router = Router();

function buildSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 6)
  );
}

function serializeBiz(b: typeof businessesTable.$inferSelect, categoryName?: string) {
  return {
    ...b,
    categoryName: categoryName ?? null,
    latitude: b.latitude ? Number(b.latitude) : null,
    longitude: b.longitude ? Number(b.longitude) : null,
    businessHours: b.businessHoursJson ? JSON.parse(b.businessHoursJson) : null,
    socialLinks: b.socialLinksJson ? JSON.parse(b.socialLinksJson) : null,
    faqs: b.faqsJson ? JSON.parse(b.faqsJson) : null,
    images: b.imagesJson ? JSON.parse(b.imagesJson) : [],
    createdAt: b.createdAt?.toISOString(),
    approvedAt: b.approvedAt?.toISOString() ?? null,
  };
}

router.get("/", async (req, res) => {
  const parsed = ListBusinessesQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query" });

  const { category, status, premium, verified, q, page = 1, limit = 20, ownerEmail } = parsed.data;

  const conditions: ReturnType<typeof eq>[] = [];
  if (status && status !== "all") {
    conditions.push(eq(businessesTable.status, status) as any);
  } else if (!status) {
    conditions.push(eq(businessesTable.status, "approved") as any);
  }
  if (premium === "true") conditions.push(eq(businessesTable.isPremium, true) as any);
  if (verified === "true") conditions.push(eq(businessesTable.isVerified, true) as any);
  if (ownerEmail) conditions.push(eq(businessesTable.ownerEmail, ownerEmail) as any);
  if (q) {
    conditions.push(
      or(
        ilike(businessesTable.name, `%${q}%`),
        ilike(businessesTable.description, `%${q}%`)
      )! as any
    );
  }

  if (category) {
    const cats = await db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, category));
    if (cats[0]) conditions.push(eq(businessesTable.categoryId, cats[0].id) as any);
  }

  const where = conditions.length > 0 ? and(...(conditions as any)) : undefined;

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(businessesTable)
    .where(where);

  const offset = ((page ?? 1) - 1) * (limit ?? 20);
  const rows = await db
    .select()
    .from(businessesTable)
    .where(where)
    .orderBy(
      desc(businessesTable.isPremium),
      desc(businessesTable.isVerified),
      desc(businessesTable.isFeatured),
      desc(businessesTable.viewCount),
      desc(businessesTable.createdAt)
    )
    .limit(limit ?? 20)
    .offset(offset);

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map((c) => [c.id, c.name]));

  return res.json({
    businesses: rows.map((b) => serializeBiz(b, catMap.get(b.categoryId))),
    total,
    page: page ?? 1,
    limit: limit ?? 20,
  });
});

// Tiered carousels endpoint for homepage
router.get("/carousels", async (req, res) => {
  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map((c) => [c.id, c.name]));

  const base = and(eq(businessesTable.status, "approved"), eq(businessesTable.isSuspended, false));

  const [trendingRows, platinumRows, trustedRows, masterRows, topViewsRows, freeRows, masterProductRows] = await Promise.all([
    // Trending Now: isFeatured = true, shuffled
    db.select().from(businessesTable)
      .where(and(base, eq(businessesTable.isFeatured, true)))
      .orderBy(desc(businessesTable.viewCount))
      .limit(20),
    // Platinum: isPremium + isVerified
    db.select().from(businessesTable)
      .where(and(base, eq(businessesTable.isPremium, true), eq(businessesTable.isVerified, true)))
      .orderBy(desc(businessesTable.viewCount))
      .limit(20),
    // Trusted: isVerified only (not premium)
    db.select().from(businessesTable)
      .where(and(base, eq(businessesTable.isVerified, true)))
      .orderBy(desc(businessesTable.viewCount))
      .limit(20),
    // Master Products: isPremium + isFeatured
    db.select().from(businessesTable)
      .where(and(base, eq(businessesTable.isPremium, true)))
      .orderBy(desc(businessesTable.viewCount))
      .limit(20),
    // Top Views: highest view count
    db.select().from(businessesTable)
      .where(base)
      .orderBy(desc(businessesTable.viewCount))
      .limit(20),
    // Free Listing: not premium (basic free listings)
    db.select().from(businessesTable)
      .where(and(base, eq(businessesTable.isPremium, false)))
      .orderBy(sql`RANDOM()`)
      .limit(20),
    // Master Product Items: approved products from approved businesses
    db.select({
      id: productsTable.id,
      name: productsTable.name,
      price: productsTable.price,
      imageUrl: productsTable.imageUrl,
      imagesJson: productsTable.imagesJson,
      businessId: productsTable.businessId,
      businessName: businessesTable.name,
      businessSlug: businessesTable.slug,
    })
      .from(productsTable)
      .innerJoin(businessesTable, eq(productsTable.businessId, businessesTable.id))
      .where(and(eq(productsTable.status, "approved"), eq(businessesTable.status, "approved"), eq(businessesTable.isSuspended, false)))
      .orderBy(sql`RANDOM()`)
      .limit(24),
  ]);

  function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  return res.json({
    trendingNow: shuffle(trendingRows).map((b) => serializeBiz(b, catMap.get(b.categoryId))),
    platinum: shuffle(platinumRows).map((b) => serializeBiz(b, catMap.get(b.categoryId))),
    trusted: shuffle(trustedRows).map((b) => serializeBiz(b, catMap.get(b.categoryId))),
    masterProducts: shuffle(masterRows).map((b) => serializeBiz(b, catMap.get(b.categoryId))),
    masterProductItems: masterProductRows.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
      imagesJson: p.imagesJson,
      businessId: p.businessId,
      businessName: p.businessName,
      businessSlug: p.businessSlug,
    })),
    topViews: shuffle(topViewsRows).map((b) => serializeBiz(b, catMap.get(b.categoryId))),
    freeListing: freeRows.map((b) => serializeBiz(b, catMap.get(b.categoryId))),
  });
});

router.get("/featured", async (req, res) => {
  const premiumRows = await db
    .select()
    .from(businessesTable)
    .where(and(eq(businessesTable.status, "approved"), eq(businessesTable.isPremium, true)))
    .orderBy(desc(businessesTable.createdAt))
    .limit(8);

  const featuredRows = await db
    .select()
    .from(businessesTable)
    .where(and(eq(businessesTable.status, "approved"), eq(businessesTable.isFeatured, true)))
    .orderBy(desc(businessesTable.createdAt))
    .limit(8);

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map((c) => [c.id, c.name]));

  return res.json({
    premium: premiumRows.map((b) => serializeBiz(b, catMap.get(b.categoryId))),
    featured: featuredRows.map((b) => serializeBiz(b, catMap.get(b.categoryId))),
  });
});

router.get("/:slug", async (req, res) => {
  const p = GetBusinessParams.safeParse(req.params);
  if (!p.success) return res.status(400).json({ error: "Invalid" });

  const [biz] = await db
    .select()
    .from(businessesTable)
    .where(eq(businessesTable.slug, p.data.slug));
  if (!biz) return res.status(404).json({ error: "Not found" });

  const [cat] = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, biz.categoryId));

  const approvedReviews = await db
    .select()
    .from(reviewsTable)
    .where(
      and(eq(reviewsTable.businessId, biz.id), eq(reviewsTable.status, "approved"))
    );

  const avgRating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
      : null;

  return res.json({
    ...serializeBiz(biz, cat?.name),
    reviews: approvedReviews.map((r) => ({
      ...r,
      createdAt: r.createdAt?.toISOString(),
    })),
    averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    reviewCount: approvedReviews.length,
  });
});

router.post("/", async (req, res) => {
  const parsed = CreateBusinessBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { name, categoryId, businessHours, socialLinks, faqs, images, ...rest } = parsed.data;
  const slug = buildSlug(name);

  const autoApproveRow = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, "autoApproveListings")).limit(1);
  const autoApprove = autoApproveRow[0]?.value === "true";
  const initialStatus = autoApprove ? "approved" : "pending";

  const [biz] = await db
    .insert(businessesTable)
    .values({
      name,
      slug,
      categoryId,
      ...rest,
      status: initialStatus,
      approvedAt: autoApprove ? new Date() : undefined,
      latitude: rest.latitude ? String(rest.latitude) : null,
      longitude: rest.longitude ? String(rest.longitude) : null,
      businessHoursJson: businessHours ? JSON.stringify(businessHours) : null,
      socialLinksJson: socialLinks ? JSON.stringify(socialLinks) : null,
      faqsJson: faqs ? JSON.stringify(faqs) : null,
      imagesJson: images ? JSON.stringify(images) : null,
    })
    .returning();

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    sendEmail({
      to: adminEmail,
      subject: `🏢 New Business Listing: ${name}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#ea5c29">New Business Listing Submitted</h2>
        <p><strong>${name}</strong> has been submitted for review.</p>
        <p><a href="${process.env.SITE_URL ?? ""}/admin" style="background:#ea5c29;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">Review in Admin Panel →</a></p>
      </div>`,
    }).catch(() => {});
  }

  if (rest.ownerEmail) {
    sendEmail({
      to: rest.ownerEmail,
      subject: `✅ Your business listing is submitted — ${name}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#ea5c29">Listing Submitted Successfully!</h2>
        <p>Your business <strong>${name}</strong> has been submitted to Hasanpur Connect for review.</p>
        <p>We'll review and approve your listing within 24 hours. You'll receive an email once it's live.</p>
        <p><a href="${process.env.SITE_URL ?? ""}/dashboard" style="background:#ea5c29;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">Track Status in Dashboard →</a></p>
      </div>`,
    }).catch(() => {});
  }

  return res.status(201).json(serializeBiz(biz));
});

router.put("/:id", async (req, res) => {
  const p = UpdateBusinessParams.safeParse(req.params);
  const body = UpdateBusinessBody.safeParse(req.body);
  if (!p.success || !body.success) return res.status(400).json({ error: "Invalid input" });

  const { businessHours, socialLinks, faqs, images, ...rest } = body.data;

  const updates: Partial<typeof businessesTable.$inferInsert> = { ...rest };
  if (businessHours !== undefined) updates.businessHoursJson = JSON.stringify(businessHours);
  if (socialLinks !== undefined) updates.socialLinksJson = JSON.stringify(socialLinks);
  if (faqs !== undefined) updates.faqsJson = JSON.stringify(faqs);
  if (images !== undefined) updates.imagesJson = JSON.stringify(images);

  // When owner edits, reset to pending so admin must re-approve
  updates.status = "pending";
  updates.approvedAt = null as any;

  const [biz] = await db
    .update(businessesTable)
    .set(updates)
    .where(eq(businessesTable.id, p.data.id))
    .returning();
  if (!biz) return res.status(404).json({ error: "Not found" });

  // Save edit history
  await db.insert(businessEditHistoryTable).values({
    businessId: biz.id,
    editedBy: biz.ownerEmail ?? "owner",
    changesJson: JSON.stringify(body.data),
    previousStatusJson: JSON.stringify({ status: "approved" }),
  }).catch(() => {});

  // Create admin notification for the edit
  await db.insert(adminNotificationsTable).values({
    type: "listing_edited",
    title: "Listing Edit Requires Review",
    message: `${biz.name} has been updated by the owner and needs re-approval before going live.`,
    entityId: biz.id,
    entityType: "business",
  }).catch(() => {});

  // Email — listing edited → admin
  if (process.env.ADMIN_EMAIL) {
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `✏️ Business listing edited — ${biz.name}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#ea5c29">Business Listing Edited — Review Required</h2>
        <p>The listing for <strong>${biz.name}</strong> has been updated by the business owner and is now <strong>pending re-approval</strong>.</p>
        <p><a href="${process.env.SITE_URL ?? ""}/admin" style="background:#ea5c29;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">Review in Admin →</a></p>
      </div>`,
    }).catch(() => {});
  }

  return res.json(serializeBiz(biz));
});

router.patch("/:id/admin-edit", requireAdminAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const body = UpdateBusinessBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid input" });

  const [existing] = await db.select().from(businessesTable).where(eq(businessesTable.id, id)).limit(1);
  if (!existing) return res.status(404).json({ error: "Not found" });

  const { businessHours, socialLinks, faqs, images, ...rest } = body.data;
  const updates: Partial<typeof businessesTable.$inferInsert> = { ...rest };
  if (businessHours !== undefined) updates.businessHoursJson = JSON.stringify(businessHours);
  if (socialLinks !== undefined) updates.socialLinksJson = JSON.stringify(socialLinks);
  if (faqs !== undefined) updates.faqsJson = JSON.stringify(faqs);
  if (images !== undefined) updates.imagesJson = JSON.stringify(images);

  const [biz] = await db.update(businessesTable).set(updates).where(eq(businessesTable.id, id)).returning();
  if (!biz) return res.status(404).json({ error: "Not found" });

  await db.insert(businessEditHistoryTable).values({
    businessId: biz.id,
    editedBy: "admin",
    changesJson: JSON.stringify(body.data),
    previousStatusJson: JSON.stringify({ status: existing.status }),
  }).catch(() => {});

  return res.json(serializeBiz(biz));
});

router.patch("/:id/badge", requireAdminAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const { customBadge, customBadgeColor, customBadgeStartDate, customBadgeEndDate } = req.body;
  const updates: any = {};
  if (customBadge !== undefined) updates.customBadge = customBadge || null;
  if (customBadgeColor !== undefined) updates.customBadgeColor = customBadgeColor || null;
  if (customBadgeStartDate !== undefined) updates.customBadgeStartDate = customBadgeStartDate ? new Date(customBadgeStartDate) : null;
  if (customBadgeEndDate !== undefined) updates.customBadgeEndDate = customBadgeEndDate ? new Date(customBadgeEndDate) : null;
  const [biz] = await db.update(businessesTable).set(updates).where(eq(businessesTable.id, id)).returning();
  if (!biz) return res.status(404).json({ error: "Not found" });
  return res.json(serializeBiz(biz));
});

router.patch("/:id/featured-expiry", requireAdminAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const { featuredExpiresAt, isFeatured } = req.body;
  const updates: any = {};
  if (featuredExpiresAt !== undefined) updates.featuredExpiresAt = featuredExpiresAt ? new Date(featuredExpiresAt) : null;
  if (isFeatured !== undefined) updates.isFeatured = isFeatured;
  const [biz] = await db.update(businessesTable).set(updates).where(eq(businessesTable.id, id)).returning();
  if (!biz) return res.status(404).json({ error: "Not found" });
  return res.json(serializeBiz(biz));
});

router.get("/:id/pending-edit", requireAdminAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const [biz] = await db.select({ pendingEditJson: businessesTable.pendingEditJson, pendingEditStatus: businessesTable.pendingEditStatus, name: businessesTable.name }).from(businessesTable).where(eq(businessesTable.id, id)).limit(1);
  if (!biz) return res.status(404).json({ error: "Not found" });
  return res.json({ pendingEdit: biz.pendingEditJson ? JSON.parse(biz.pendingEditJson) : null, pendingEditStatus: biz.pendingEditStatus });
});

router.patch("/:id/pending-edit", requireAdminAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  const { action } = req.body;
  if (!action) return res.status(400).json({ error: "action required (approve|reject)" });
  const [biz] = await db.select().from(businessesTable).where(eq(businessesTable.id, id)).limit(1);
  if (!biz) return res.status(404).json({ error: "Not found" });
  if (action === "approve" && biz.pendingEditJson) {
    const edits = JSON.parse(biz.pendingEditJson);
    const updates: any = { ...edits, pendingEditJson: null, pendingEditStatus: "approved", status: "approved", approvedAt: new Date() };
    await db.update(businessesTable).set(updates).where(eq(businessesTable.id, id));
  } else {
    await db.update(businessesTable).set({ pendingEditJson: null, pendingEditStatus: "rejected" }).where(eq(businessesTable.id, id));
  }
  return res.json({ ok: true });
});

router.patch("/:id/status", requireAdminAuth, async (req, res) => {
  const p = UpdateBusinessStatusParams.safeParse(req.params);
  const body = UpdateBusinessStatusBody.safeParse(req.body);
  if (!p.success || !body.success) return res.status(400).json({ error: "Invalid input" });

  const updates: Partial<typeof businessesTable.$inferInsert> = { status: body.data.status };
  if (body.data.status === "approved") { updates.approvedAt = new Date(); updates.isSuspended = false; }
  if (body.data.status === "suspended") { updates.isSuspended = true; }

  // S28: cascade suspension to products
  if (body.data.status === "suspended") {
    await db.update(productsTable).set({ status: "suspended" }).where(eq(productsTable.businessId, p.data.id));
  } else if (body.data.status === "approved") {
    await db.update(productsTable).set({ status: "approved" }).where(and(eq(productsTable.businessId, p.data.id), eq(productsTable.status, "suspended")));
  }
  if (body.data.isPremium !== undefined) updates.isPremium = body.data.isPremium;
  if (body.data.isVerified !== undefined) updates.isVerified = body.data.isVerified;
  if (body.data.isFeatured !== undefined) updates.isFeatured = body.data.isFeatured;
  if ((body.data as any).featuredExpiresAt !== undefined) updates.featuredExpiresAt = (body.data as any).featuredExpiresAt ? new Date((body.data as any).featuredExpiresAt) : null;

  const [biz] = await db
    .update(businessesTable)
    .set(updates)
    .where(eq(businessesTable.id, p.data.id))
    .returning();
  if (!biz) return res.status(404).json({ error: "Not found" });

  if (body.data.status === "approved" && biz.ownerEmail) {
    sendEmail({
      to: biz.ownerEmail,
      subject: `🎉 Your business is now live on Hasanpur Connect!`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#ea5c29">🎉 Your Business is Live!</h2>
        <p>Great news! Your business <strong>${biz.name}</strong> has been approved and is now live on Hasanpur Connect.</p>
        <p><a href="${process.env.SITE_URL ?? ""}/business/${biz.slug}" style="background:#ea5c29;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View Your Listing →</a></p>
        <p>Log in to your dashboard to manage your listing, respond to enquiries, and track performance.</p>
        <p><a href="${process.env.SITE_URL ?? ""}/dashboard" style="color:#ea5c29;font-weight:600">Go to Dashboard →</a></p>
      </div>`,
    }).catch(() => {});
  }

  return res.json(serializeBiz(biz));
});

router.delete("/:id", requireAdminAuth, async (req, res) => {
  const p = DeleteBusinessParams.safeParse(req.params);
  if (!p.success) return res.status(400).json({ error: "Invalid" });

  // Capture business name before deletion for notification
  const [bizToDelete] = await db.select({ name: businessesTable.name, ownerEmail: businessesTable.ownerEmail }).from(businessesTable).where(eq(businessesTable.id, p.data.id));

  await db.delete(reviewsTable).where(eq(reviewsTable.businessId, p.data.id));
  await db.delete(enquiriesTable).where(eq(enquiriesTable.businessId, p.data.id));
  await db.delete(productsTable).where(eq(productsTable.businessId, p.data.id));
  await db
    .delete(analyticsEventsTable)
    .where(
      and(
        eq(analyticsEventsTable.entityType, "business"),
        eq(analyticsEventsTable.entityId, p.data.id)
      )
    );
  await db.delete(businessesTable).where(eq(businessesTable.id, p.data.id));

  // Email — listing deleted → admin
  if (bizToDelete && process.env.ADMIN_EMAIL) {
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `🗑️ Business listing deleted — ${bizToDelete.name}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#ea5c29">Business Listing Deleted</h2>
        <p>The listing for <strong>${bizToDelete.name}</strong> has been permanently deleted from Hasanpur Connect.</p>
        ${bizToDelete.ownerEmail ? `<p>Owner email: <strong>${bizToDelete.ownerEmail}</strong></p>` : ""}
      </div>`,
    }).catch(() => {});
  }

  return res.status(204).send();
});

router.get("/:id/analytics", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const [biz] = await db
    .select({ viewCount: businessesTable.viewCount })
    .from(businessesTable)
    .where(eq(businessesTable.id, id));
  if (!biz) return res.status(404).json({ error: "Not found" });

  const [{ enquiryCount }] = await db
    .select({ enquiryCount: sql<number>`count(*)::int` })
    .from(enquiriesTable)
    .where(eq(enquiriesTable.businessId, id));

  const [{ reviewCount }] = await db
    .select({ reviewCount: sql<number>`count(*)::int` })
    .from(reviewsTable)
    .where(
      and(eq(reviewsTable.businessId, id), eq(reviewsTable.status, "approved"))
    );

  const recentEvents = await db
    .select()
    .from(analyticsEventsTable)
    .where(
      and(
        eq(analyticsEventsTable.entityType, "business"),
        eq(analyticsEventsTable.entityId, id)
      )
    )
    .orderBy(desc(analyticsEventsTable.createdAt))
    .limit(50);

  return res.json({
    viewCount: biz.viewCount,
    enquiryCount,
    reviewCount,
    recentEvents: recentEvents.map((e) => ({
      ...e,
      createdAt: e.createdAt?.toISOString(),
    })),
  });
});

router.get("/:id/edit-history", requireAdminAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const history = await db
    .select()
    .from(businessEditHistoryTable)
    .where(eq(businessEditHistoryTable.businessId, id))
    .orderBy(desc(businessEditHistoryTable.createdAt))
    .limit(20);
  return res.json(history.map(h => ({
    ...h,
    createdAt: h.createdAt?.toISOString(),
  })));
});

export default router;
