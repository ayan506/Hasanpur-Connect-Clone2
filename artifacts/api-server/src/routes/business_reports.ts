import { Router } from "express";
import { db } from "@workspace/db";
import { businessReportsTable, businessesTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { requireAdminAuth } from "../middlewares/adminAuth";
import { sendEmail } from "../email/send-email";

const router = Router();

router.post("/", async (req, res) => {
  const { businessId, reason, description, reporterName } = req.body;
  if (!businessId || !reason) return res.status(400).json({ error: "businessId and reason required" });
  const [report] = await db.insert(businessReportsTable).values({
    businessId: Number(businessId),
    reason,
    description: description || null,
    reporterName: reporterName || null,
  }).returning();
  // Email — new report/flag → admin
  if (process.env.ADMIN_EMAIL) {
    const [biz] = await db.select({ name: businessesTable.name, slug: businessesTable.slug }).from(businessesTable).where(eq(businessesTable.id, Number(businessId)));
    const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(businessReportsTable).where(eq(businessReportsTable.businessId, Number(businessId)));
    const thresholdWarning = total >= 3
      ? `<p style="color:#dc2626;font-weight:600">⚠️ Warning: This business has now received <strong>${total} reports</strong>. Consider reviewing it immediately.</p>`
      : "";
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: total >= 3
        ? `🚨 Report threshold crossed — ${biz?.name ?? `Business #${businessId}`} (${total} reports)`
        : `🚩 New report/flag on ${biz?.name ?? `Business #${businessId}`}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#ea5c29">New Business Report</h2>
        <table style="width:100%;border-collapse:collapse;margin:12px 0">
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Business</td><td style="padding:8px;border:1px solid #e5e7eb">${biz?.name ?? `#${businessId}`}</td></tr>
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Reason</td><td style="padding:8px;border:1px solid #e5e7eb">${reason}</td></tr>
          ${description ? `<tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Details</td><td style="padding:8px;border:1px solid #e5e7eb">${description}</td></tr>` : ""}
          ${reporterName ? `<tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Reported By</td><td style="padding:8px;border:1px solid #e5e7eb">${reporterName}</td></tr>` : ""}
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Total Reports</td><td style="padding:8px;border:1px solid #e5e7eb">${total}</td></tr>
        </table>
        ${thresholdWarning}
        <p><a href="${process.env.SITE_URL ?? ""}/admin" style="background:#ea5c29;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">Review in Admin →</a></p>
      </div>`,
    }).catch(() => {});
  }

  return res.status(201).json({ ...report, createdAt: report.createdAt?.toISOString() });
});

router.get("/", requireAdminAuth, async (_req, res) => {
  const reports = await db.select().from(businessReportsTable)
    .orderBy(desc(businessReportsTable.createdAt));
  const bizIds = [...new Set(reports.map((r) => r.businessId))];
  const businesses = bizIds.length > 0
    ? await db.select({ id: businessesTable.id, name: businessesTable.name, slug: businessesTable.slug }).from(businessesTable)
    : [];
  const bizMap = new Map(businesses.map((b) => [b.id, { name: b.name, slug: b.slug }]));

  const countsByBiz = await db
    .select({ businessId: businessReportsTable.businessId, count: sql<number>`count(*)::int` })
    .from(businessReportsTable)
    .groupBy(businessReportsTable.businessId);
  const countMap = new Map(countsByBiz.map((c) => [c.businessId, c.count]));

  return res.json(reports.map((r) => ({
    ...r,
    businessName: bizMap.get(r.businessId)?.name ?? null,
    businessSlug: bizMap.get(r.businessId)?.slug ?? null,
    totalReportsForBusiness: countMap.get(r.businessId) ?? 0,
    createdAt: r.createdAt?.toISOString(),
  })));
});

router.patch("/:id/status", requireAdminAuth, async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "status required" });
  const [report] = await db.update(businessReportsTable)
    .set({ status })
    .where(eq(businessReportsTable.id, Number(req.params.id)))
    .returning();
  if (!report) return res.status(404).json({ error: "Not found" });
  return res.json({ ...report, createdAt: report.createdAt?.toISOString() });
});

export default router;
