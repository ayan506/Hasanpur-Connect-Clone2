import { Router } from "express";
import { db } from "@workspace/db";
import { announcementsTable, businessesTable, categoriesTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdminAuth } from "../middlewares/adminAuth";
import { sendEmail } from "../email/send-email";

const router = Router();

router.get("/", requireAdminAuth, async (_req, res) => {
  const rows = await db.select().from(announcementsTable).orderBy(desc(announcementsTable.createdAt)).limit(100);
  return res.json(rows.map(r => ({ ...r, sentAt: r.sentAt?.toISOString() ?? null, createdAt: r.createdAt?.toISOString() ?? null })));
});

router.post("/", requireAdminAuth, async (req, res) => {
  const { title, message, targetType, targetCategoryId, targetBusinessId } = req.body;
  if (!title || !message || !targetType) return res.status(400).json({ error: "title, message, targetType required" });

  const [announcement] = await db.insert(announcementsTable).values({
    title,
    message,
    targetType,
    targetCategoryId: targetCategoryId ?? null,
    targetBusinessId: targetBusinessId ?? null,
    sentAt: new Date(),
    deliveryStatus: "sending",
  }).returning();

  let recipients: string[] = [];

  if (targetType === "all") {
    const owners = await db.select({ email: businessesTable.ownerEmail })
      .from(businessesTable)
      .where(eq(businessesTable.status, "approved"));
    recipients = [...new Set(owners.map(o => o.email).filter(Boolean) as string[])];
  } else if (targetType === "category" && targetCategoryId) {
    const owners = await db.select({ email: businessesTable.ownerEmail })
      .from(businessesTable)
      .where(eq(businessesTable.categoryId, targetCategoryId));
    recipients = [...new Set(owners.map(o => o.email).filter(Boolean) as string[])];
  } else if (targetType === "business" && targetBusinessId) {
    const [biz] = await db.select({ email: businessesTable.ownerEmail })
      .from(businessesTable)
      .where(eq(businessesTable.id, targetBusinessId));
    if (biz?.email) recipients = [biz.email];
  }

  let sent = 0;
  for (const email of recipients) {
    await sendEmail({
      to: email,
      subject: `📢 ${title} — Hasanpur Connect`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#ea5c29">${title}</h2>
        <div style="white-space:pre-line">${message}</div>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
        <p style="color:#9ca3af;font-size:12px">This is an official announcement from Hasanpur Connect. <a href="${process.env.SITE_URL ?? ""}/dashboard">View your dashboard</a></p>
      </div>`,
    }).catch(() => {});
    sent++;
  }

  await db.update(announcementsTable).set({ deliveryStatus: `sent to ${sent} owners` }).where(eq(announcementsTable.id, announcement.id));

  return res.status(201).json({ id: announcement.id, sent, ok: true });
});

router.delete("/:id", requireAdminAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
  return res.status(204).send();
});

export default router;
