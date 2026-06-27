import { Router } from "express";
import { db } from "@workspace/db";
import { webdevEnquiriesTable } from "@workspace/db";
import { SubmitWebDevEnquiryBody } from "@workspace/api-zod";
import { sendEmail } from "../email/send-email";

const router = Router();

router.get("/", async (_req, res) => {
  const rows = await db.select().from(webdevEnquiriesTable).orderBy(webdevEnquiriesTable.createdAt);
  return res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt?.toISOString() })));
});

router.post("/", async (req, res) => {
  const parsed = SubmitWebDevEnquiryBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const [enquiry] = await db.insert(webdevEnquiriesTable).values(parsed.data).returning();

  // Email — webdev enquiry submitted → admin
  if (process.env.ADMIN_EMAIL) {
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `💻 New website development enquiry — ${enquiry.businessName ?? "Unknown"}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#ea5c29">New Web Development Enquiry</h2>
        <table style="width:100%;border-collapse:collapse;margin:12px 0">
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Business</td><td style="padding:8px;border:1px solid #e5e7eb">${enquiry.businessName ?? "Not provided"}</td></tr>
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Contact</td><td style="padding:8px;border:1px solid #e5e7eb">${enquiry.name ?? "Not provided"}</td></tr>
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Phone</td><td style="padding:8px;border:1px solid #e5e7eb">${enquiry.phone ?? "Not provided"}</td></tr>
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Email</td><td style="padding:8px;border:1px solid #e5e7eb">${enquiry.email ?? "Not provided"}</td></tr>
          ${enquiry.message ? `<tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Message</td><td style="padding:8px;border:1px solid #e5e7eb">${enquiry.message}</td></tr>` : ""}
        </table>
        <p><a href="${process.env.SITE_URL ?? ""}/admin" style="background:#ea5c29;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View in Admin →</a></p>
      </div>`,
    }).catch(() => {});
  }

  return res.status(201).json({ ...enquiry, createdAt: enquiry.createdAt?.toISOString() });
});

export default router;
