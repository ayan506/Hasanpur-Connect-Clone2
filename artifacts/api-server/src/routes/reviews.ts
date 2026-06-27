import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable, businessesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { SubmitReviewBody, UpdateReviewStatusBody, UpdateReviewStatusParams, DeleteReviewParams, ListReviewsQueryParams } from "@workspace/api-zod";
import { checkReviewMilestone } from "../email/milestones";
import { sendEmail } from "../email/send-email";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = ListReviewsQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query" });
  const conditions = [];
  if (parsed.data.businessId) conditions.push(eq(reviewsTable.businessId, parsed.data.businessId));
  if (parsed.data.status) conditions.push(eq(reviewsTable.status, parsed.data.status));
  const where = conditions.length > 0 ? and(...(conditions as any)) : undefined;
  const rows = await db.select().from(reviewsTable).where(where).orderBy(reviewsTable.createdAt);
  const bizIds = [...new Set(rows.map((r) => r.businessId))];
  const businesses = bizIds.length > 0 ? await db.select({ id: businessesTable.id, name: businessesTable.name }).from(businessesTable) : [];
  const bizMap = new Map(businesses.map((b) => [b.id, b.name]));
  return res.json(rows.map((r) => ({ ...r, businessName: bizMap.get(r.businessId) ?? null, createdAt: r.createdAt?.toISOString() })));
});

router.post("/", async (req, res) => {
  const parsed = SubmitReviewBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  if (parsed.data.rating < 1 || parsed.data.rating > 5) return res.status(400).json({ error: "Rating must be 1-5" });
  const [review] = await db.insert(reviewsTable).values({ ...parsed.data, status: "pending" }).returning();

  // Email — new review pending moderation → admin
  if (process.env.ADMIN_EMAIL) {
    const [biz] = await db.select({ name: businessesTable.name }).from(businessesTable).where(eq(businessesTable.id, review.businessId));
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `⭐ New review pending moderation`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#ea5c29">New Review Pending Moderation</h2>
        <table style="width:100%;border-collapse:collapse;margin:12px 0">
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Business</td><td style="padding:8px;border:1px solid #e5e7eb">${biz?.name ?? `#${review.businessId}`}</td></tr>
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Reviewer</td><td style="padding:8px;border:1px solid #e5e7eb">${review.reviewerName}</td></tr>
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Rating</td><td style="padding:8px;border:1px solid #e5e7eb">${review.rating}/5</td></tr>
          ${review.content ? `<tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Review</td><td style="padding:8px;border:1px solid #e5e7eb">${review.content}</td></tr>` : ""}
        </table>
        <p><a href="${process.env.SITE_URL ?? ""}/admin" style="background:#ea5c29;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">Moderate in Admin →</a></p>
      </div>`,
    }).catch(() => {});
  }

  return res.status(201).json({ ...review, businessName: null, createdAt: review.createdAt?.toISOString() });
});

router.patch("/:id/status", async (req, res) => {
  const p = UpdateReviewStatusParams.safeParse(req.params);
  const body = UpdateReviewStatusBody.safeParse(req.body);
  if (!p.success || !body.success) return res.status(400).json({ error: "Invalid input" });
  const [review] = await db.update(reviewsTable).set({ status: body.data.status }).where(eq(reviewsTable.id, p.data.id)).returning();
  if (!review) return res.status(404).json({ error: "Not found" });
  // Milestone — first_review (only when approved)
  if (body.data.status === "approved") {
    checkReviewMilestone(review.businessId).catch(() => {});
  }
  return res.json({ ...review, businessName: null, createdAt: review.createdAt?.toISOString() });
});

router.delete("/:id", async (req, res) => {
  const p = DeleteReviewParams.safeParse(req.params);
  if (!p.success) return res.status(400).json({ error: "Invalid" });
  await db.delete(reviewsTable).where(eq(reviewsTable.id, p.data.id));
  return res.status(204).send();
});

export default router;
