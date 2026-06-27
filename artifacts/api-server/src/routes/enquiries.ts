import { Router } from "express";
import { db } from "@workspace/db";
import { enquiriesTable, businessesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { SubmitEnquiryBody, ListEnquiriesQueryParams } from "@workspace/api-zod";
import { sendEmail } from "../email/send-email";
import { checkEnquiryMilestone } from "../email/milestones";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = ListEnquiriesQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query" });
  const where = parsed.data.businessId ? eq(enquiriesTable.businessId, parsed.data.businessId) : undefined;
  const rows = await db.select().from(enquiriesTable).where(where).orderBy(enquiriesTable.createdAt);
  const bizIds = [...new Set(rows.map((r) => r.businessId))];
  const businesses = bizIds.length > 0 ? await db.select({ id: businessesTable.id, name: businessesTable.name }).from(businessesTable) : [];
  const bizMap = new Map(businesses.map((b) => [b.id, b.name]));
  return res.json(rows.map((r) => ({ ...r, businessName: bizMap.get(r.businessId) ?? null, createdAt: r.createdAt?.toISOString() })));
});

router.post("/", async (req, res) => {
  const parsed = SubmitEnquiryBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const [enquiry] = await db.insert(enquiriesTable).values(parsed.data).returning();

  // Email #6 — New enquiry → business owner
  const [biz] = await db
    .select({ name: businessesTable.name, ownerEmail: businessesTable.ownerEmail })
    .from(businessesTable)
    .where(eq(businessesTable.id, enquiry.businessId));

  if (biz?.ownerEmail) {
    const siteUrl = process.env.SITE_URL ?? "";
    sendEmail({
      to: biz.ownerEmail,
      subject: `📩 New enquiry on ${biz.name}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#ea5c29">📩 New Enquiry for ${biz.name}</h2>
        <p>Someone is interested in your business! Here are their details:</p>
        <table style="width:100%;border-collapse:collapse;margin:12px 0">
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Name</td><td style="padding:8px;border:1px solid #e5e7eb">${enquiry.name ?? "N/A"}</td></tr>
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Phone</td><td style="padding:8px;border:1px solid #e5e7eb">${enquiry.phone ?? "N/A"}</td></tr>
          ${enquiry.email ? `<tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Email</td><td style="padding:8px;border:1px solid #e5e7eb">${enquiry.email}</td></tr>` : ""}
          ${enquiry.message ? `<tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Message</td><td style="padding:8px;border:1px solid #e5e7eb">${enquiry.message}</td></tr>` : ""}
        </table>
        <p><a href="${siteUrl}/dashboard" style="background:#ea5c29;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View in Dashboard →</a></p>
      </div>`,
    }).catch(() => {});

    // Milestone — first_enquiry
    checkEnquiryMilestone(enquiry.businessId).catch(() => {});
  }

  return res.status(201).json({ ...enquiry, businessName: biz?.name ?? null, createdAt: enquiry.createdAt?.toISOString() });
});

export default router;
