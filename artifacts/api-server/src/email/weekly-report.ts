import { db } from "@workspace/db";
import {
  businessesTable,
  analyticsEventsTable,
  enquiriesTable,
  reviewsTable,
} from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { sendEmail } from "./send-email";

async function sendWeeklyReport(businessId: number): Promise<void> {
  const [biz] = await db
    .select()
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId));

  if (!biz?.ownerEmail || biz.status !== "approved") return;

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [{ views }] = await db
    .select({ views: sql<number>`count(*)::int` })
    .from(analyticsEventsTable)
    .where(
      and(
        eq(analyticsEventsTable.eventType, "view"),
        eq(analyticsEventsTable.entityType, "business"),
        eq(analyticsEventsTable.entityId, businessId),
        gte(analyticsEventsTable.createdAt, since)
      )
    );

  const [{ enquiries }] = await db
    .select({ enquiries: sql<number>`count(*)::int` })
    .from(enquiriesTable)
    .where(
      and(
        eq(enquiriesTable.businessId, businessId),
        gte(enquiriesTable.createdAt, since)
      )
    );

  const [{ reviews }] = await db
    .select({ reviews: sql<number>`count(*)::int` })
    .from(reviewsTable)
    .where(
      and(
        eq(reviewsTable.businessId, businessId),
        gte(reviewsTable.createdAt, since)
      )
    );

  const siteUrl = process.env.SITE_URL ?? "";

  await sendEmail({
    to: biz.ownerEmail,
    subject: `📊 Weekly Report for ${biz.name}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#ea5c29">📊 Your Weekly Business Report</h2>
      <p>Here's how <strong>${biz.name}</strong> performed this week on Hasanpur Connect:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#f9fafb">
          <td style="padding:12px;border:1px solid #e5e7eb;font-weight:600">👁️ Profile Views</td>
          <td style="padding:12px;border:1px solid #e5e7eb;font-size:1.2em;font-weight:700;color:#ea5c29">${views}</td>
        </tr>
        <tr>
          <td style="padding:12px;border:1px solid #e5e7eb;font-weight:600">📩 New Enquiries</td>
          <td style="padding:12px;border:1px solid #e5e7eb;font-size:1.2em;font-weight:700;color:#ea5c29">${enquiries}</td>
        </tr>
        <tr style="background:#f9fafb">
          <td style="padding:12px;border:1px solid #e5e7eb;font-weight:600">⭐ New Reviews</td>
          <td style="padding:12px;border:1px solid #e5e7eb;font-size:1.2em;font-weight:700;color:#ea5c29">${reviews}</td>
        </tr>
      </table>
      <p><a href="${siteUrl}/dashboard" style="background:#ea5c29;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View Full Dashboard →</a></p>
      <p style="color:#6b7280;font-size:0.85em;margin-top:24px">You are receiving this because your business is listed on Hasanpur Connect. To update your listing, visit your dashboard.</p>
    </div>`,
  });
}

export async function sendWeeklyReports(): Promise<void> {
  const businesses = await db
    .select({ id: businessesTable.id })
    .from(businessesTable)
    .where(eq(businessesTable.status, "approved"));

  for (const b of businesses) {
    await sendWeeklyReport(b.id).catch(() => {});
  }
}

export function startWeeklyCron(): void {
  if (!process.env.RESEND_API_KEY) return;

  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
  setInterval(() => {
    sendWeeklyReports().catch(() => {});
  }, MS_PER_WEEK);
}
