import { Router } from "express";
import { db } from "@workspace/db";
import { supportTicketsTable } from "@workspace/db";
import { eq, desc, or, ilike } from "drizzle-orm";
import { requireAdminAuth } from "../middlewares/adminAuth";
import { sendEmail } from "../email/send-email";

const router = Router();

function generateTicketId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `HC-${ts}-${rand}`;
}

function serialize(t: any) {
  return { ...t, createdAt: t.createdAt?.toISOString() ?? null, resolvedAt: t.resolvedAt?.toISOString() ?? null };
}

router.post("/", async (req, res) => {
  const { name, email, phone, subject, message, category } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email, and message are required" });
  }
  const ticketId = generateTicketId();
  const [ticket] = await db.insert(supportTicketsTable).values({
    ticketId,
    name,
    email,
    phone: phone ?? null,
    subject: subject || "General Enquiry",
    message,
    category: category ?? "general",
    status: "open",
    priority: "normal",
  }).returning();

  if (process.env.ADMIN_EMAIL) {
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `🎫 New Support Ticket [${ticketId}]: ${subject || "General Enquiry"}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#ea5c29">New Support Ticket</h2>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p><strong>From:</strong> ${name} (${email})</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
        <p><strong>Category:</strong> ${category ?? "general"}</p>
        <p><strong>Subject:</strong> ${subject || "General Enquiry"}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#f3f4f6;padding:12px;border-radius:8px;margin-top:8px">${message}</div>
        <p style="margin-top:16px"><a href="${process.env.SITE_URL ?? ""}/admin" style="background:#ea5c29;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View in Admin →</a></p>
      </div>`,
    }).catch(() => {});
  }

  sendEmail({
    to: email,
    subject: `✅ Your support ticket [${ticketId}] — Hasanpur Connect`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#ea5c29">We received your message</h2>
      <p>Hi ${name},</p>
      <p>Thank you for reaching out. We've received your support ticket and will respond within 24–48 hours.</p>
      <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;text-align:center">
        <p style="margin:0;font-size:13px;color:#6b7280">Your Ticket ID</p>
        <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#ea5c29;letter-spacing:2px">${ticketId}</p>
      </div>
      <p>Keep this Ticket ID safe — you can use it on our Contact Us page to check your ticket status at any time.</p>
      <p><strong>Subject:</strong> ${subject || "General Enquiry"}</p>
    </div>`,
  }).catch(() => {});

  return res.status(201).json({ id: ticket.id, ticketId: ticket.ticketId, ok: true });
});

router.get("/", requireAdminAuth, async (req, res) => {
  const { q } = req.query as { q?: string };
  let tickets: any[];
  if (q) {
    const numId = parseInt(q);
    tickets = await db.select().from(supportTicketsTable)
      .where(or(
        !isNaN(numId) ? eq(supportTicketsTable.id, numId) : undefined as any,
        ilike(supportTicketsTable.ticketId, `%${q}%`),
        ilike(supportTicketsTable.email, `%${q}%`),
        ilike(supportTicketsTable.name, `%${q}%`),
      ))
      .orderBy(desc(supportTicketsTable.createdAt))
      .limit(100);
  } else {
    tickets = await db.select().from(supportTicketsTable)
      .orderBy(desc(supportTicketsTable.createdAt))
      .limit(200);
  }
  return res.json(tickets.map(serialize));
});

router.get("/lookup", async (req, res) => {
  const { ticketId, email } = req.query as { ticketId?: string; email?: string };
  if (!ticketId) return res.status(400).json({ error: "ticketId is required" });
  const [ticket] = await db.select({
    ticketId: supportTicketsTable.ticketId,
    status: supportTicketsTable.status,
    subject: supportTicketsTable.subject,
    createdAt: supportTicketsTable.createdAt,
    resolvedAt: supportTicketsTable.resolvedAt,
  }).from(supportTicketsTable)
    .where(eq(supportTicketsTable.ticketId, ticketId.trim().toUpperCase()))
    .limit(1);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  return res.json({
    ticketId: ticket.ticketId,
    status: ticket.status,
    subject: ticket.subject,
    createdAt: ticket.createdAt?.toISOString() ?? null,
    resolvedAt: ticket.resolvedAt?.toISOString() ?? null,
  });
});

router.patch("/:id", requireAdminAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const { status, adminNotes, priority } = req.body;
  const updates: any = {};
  if (status) updates.status = status;
  if (adminNotes !== undefined) updates.adminNotes = adminNotes;
  if (priority) updates.priority = priority;
  if (status === "resolved" || status === "solved") {
    updates.status = "solved";
    updates.resolvedAt = new Date();
  }
  const [ticket] = await db.update(supportTicketsTable).set(updates)
    .where(eq(supportTicketsTable.id, id)).returning();
  if (!ticket) return res.status(404).json({ error: "Not found" });
  return res.json(serialize(ticket));
});

router.delete("/:id", requireAdminAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  await db.delete(supportTicketsTable).where(eq(supportTicketsTable.id, id));
  return res.status(204).send();
});

export default router;
