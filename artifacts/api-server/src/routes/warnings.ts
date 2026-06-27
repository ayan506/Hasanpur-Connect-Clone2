import { Router } from "express";
import { db } from "@workspace/db";
import { businessWarningsTable, businessesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendEmail } from "../email/send-email";

const router = Router();

router.post("/", async (req, res) => {
  const { businessId, message, level, sentBy } = req.body;
  if (!businessId || !message) return res.status(400).json({ error: "businessId and message required" });

  const [biz] = await db.select().from(businessesTable).where(eq(businessesTable.id, businessId)).limit(1);
  if (!biz) return res.status(404).json({ error: "Business not found" });

  const [warning] = await db
    .insert(businessWarningsTable)
    .values({ businessId, message, level, sentBy })
    .returning();

  if (biz.ownerEmail) {
    sendEmail({
      to: biz.ownerEmail,
      subject: "Important notice regarding your listing — Hasanpur Connect",
      html: `<p>Dear ${biz.ownerName || "Business Owner"},</p>
      <p>You have received an important notice regarding your business listing <strong>${biz.name}</strong>:</p>
      <blockquote style="border-left:4px solid #e5e7eb;padding-left:12px;color:#374151;">${message}</blockquote>
      <p>Please take the necessary action. If you have questions, contact us.</p>
      <p>— Hasanpur Connect Team</p>`,
    }).catch(() => {});
  }

  return res.status(201).json(warning);
});

router.get("/:businessId", async (req, res) => {
  const id = parseInt(req.params.businessId, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const warnings = await db
    .select()
    .from(businessWarningsTable)
    .where(eq(businessWarningsTable.businessId, id))
    .orderBy(businessWarningsTable.createdAt);
  return res.json(warnings);
});

export default router;
