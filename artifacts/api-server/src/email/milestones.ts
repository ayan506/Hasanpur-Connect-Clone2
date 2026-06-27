import { db } from "@workspace/db";
import {
  businessesTable,
  reviewsTable,
  enquiriesTable,
  businessMilestonesTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "./send-email";

async function hasMilestone(businessId: number, key: string): Promise<boolean> {
  const rows = await db
    .select()
    .from(businessMilestonesTable)
    .where(
      and(
        eq(businessMilestonesTable.businessId, businessId),
        eq(businessMilestonesTable.milestoneKey, key)
      )
    );
  return rows.length > 0;
}

async function recordMilestone(businessId: number, key: string): Promise<void> {
  await db.insert(businessMilestonesTable).values({ businessId, milestoneKey: key }).onConflictDoNothing();
}

function getBusinessOwnerEmail(businessId: number) {
  return db
    .select({ name: businessesTable.name, ownerEmail: businessesTable.ownerEmail })
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId))
    .then((r) => r[0] ?? null);
}

export async function checkViewMilestones(businessId: number): Promise<void> {
  const biz = await getBusinessOwnerEmail(businessId);
  if (!biz?.ownerEmail) return;

  const milestones = [
    { key: "views_100", threshold: 100, label: "100" },
    { key: "views_500", threshold: 500, label: "500" },
    { key: "views_1000", threshold: 1000, label: "1000" },
  ];

  const [bizData] = await db
    .select({ viewCount: businessesTable.viewCount })
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId));

  if (!bizData) return;

  for (const m of milestones) {
    if (bizData.viewCount >= m.threshold && !(await hasMilestone(businessId, m.key))) {
      await recordMilestone(businessId, m.key);
      sendEmail({
        to: biz.ownerEmail,
        subject: `🎉 Congratulations! Your listing hit ${m.label} views`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#ea5c29">🎉 ${m.label} Views Milestone!</h2>
          <p>Congratulations! Your business <strong>${biz.name}</strong> has reached <strong>${m.label} profile views</strong> on Hasanpur Connect.</p>
          <p>Keep up the great work and keep your listing updated to attract even more customers!</p>
          <p><a href="${process.env.SITE_URL ?? ""}/dashboard" style="background:#ea5c29;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View Dashboard →</a></p>
        </div>`,
      }).catch(() => {});
    }
  }
}

export async function checkReviewMilestone(businessId: number): Promise<void> {
  const biz = await getBusinessOwnerEmail(businessId);
  if (!biz?.ownerEmail) return;

  const approved = await db
    .select()
    .from(reviewsTable)
    .where(and(eq(reviewsTable.businessId, businessId), eq(reviewsTable.status, "approved")));

  if (approved.length === 1 && !(await hasMilestone(businessId, "first_review"))) {
    await recordMilestone(businessId, "first_review");
    sendEmail({
      to: biz.ownerEmail,
      subject: `⭐ Your first review is live on Hasanpur Connect!`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#ea5c29">⭐ First Review!</h2>
        <p>Great news! Your business <strong>${biz.name}</strong> has received its first approved review on Hasanpur Connect.</p>
        <p>Reviews help build trust with potential customers. Encourage more customers to share their experience!</p>
        <p><a href="${process.env.SITE_URL ?? ""}/dashboard" style="background:#ea5c29;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View Reviews →</a></p>
      </div>`,
    }).catch(() => {});
  }
}

export async function checkEnquiryMilestone(businessId: number): Promise<void> {
  const biz = await getBusinessOwnerEmail(businessId);
  if (!biz?.ownerEmail) return;

  const all = await db
    .select()
    .from(enquiriesTable)
    .where(eq(enquiriesTable.businessId, businessId));

  if (all.length === 1 && !(await hasMilestone(businessId, "first_enquiry"))) {
    await recordMilestone(businessId, "first_enquiry");
    sendEmail({
      to: biz.ownerEmail,
      subject: `📩 Your first customer enquiry on Hasanpur Connect!`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#ea5c29">📩 First Enquiry!</h2>
        <p>Amazing! Your business <strong>${biz.name}</strong> has received its first customer enquiry on Hasanpur Connect.</p>
        <p>Respond quickly to convert this lead into a customer!</p>
        <p><a href="${process.env.SITE_URL ?? ""}/dashboard" style="background:#ea5c29;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View Enquiries →</a></p>
      </div>`,
    }).catch(() => {});
  }
}
