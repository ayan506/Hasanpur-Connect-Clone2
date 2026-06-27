import { Router } from "express";
import { db } from "@workspace/db";
import { leadsTable, leadAssignmentsTable, businessesTable, categoriesTable } from "@workspace/db";
import { eq, desc, and, ne } from "drizzle-orm";
import { requireAdminAuth } from "../middlewares/adminAuth";
import { sendEmail } from "../email/send-email";

const router = Router();

// Create lead — stays pending, admin must approve before distribution
router.post("/", async (req, res) => {
  const { serviceRequest, categoryId, customerName, customerPhone } = req.body;
  if (!serviceRequest || !customerName || !customerPhone || !categoryId) {
    return res.status(400).json({ error: "serviceRequest, customerName, customerPhone, categoryId required" });
  }
  const [lead] = await db.insert(leadsTable).values({
    serviceRequest,
    categoryId: Number(categoryId),
    customerName,
    customerPhone,
    status: "pending",
  }).returning();

  return res.status(201).json({ ...lead, createdAt: lead.createdAt?.toISOString() });
});

// Admin: list all leads
router.get("/", requireAdminAuth, async (_req, res) => {
  const leads = await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));
  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map((c) => [c.id, c.name]));
  return res.json(leads.map((l) => ({
    ...l, categoryName: l.categoryId ? catMap.get(l.categoryId) ?? null : null,
    createdAt: l.createdAt?.toISOString(),
  })));
});

// Admin: approve lead — distribute to businesses in category
router.patch("/:id/approve", requireAdminAuth, async (req, res) => {
  const [lead] = await db.update(leadsTable)
    .set({ status: "approved" })
    .where(eq(leadsTable.id, Number(req.params.id)))
    .returning();
  if (!lead) return res.status(404).json({ error: "Not found" });

  if (lead.categoryId) {
    const businesses = await db
      .select({ id: businessesTable.id, ownerEmail: businessesTable.ownerEmail, name: businessesTable.name })
      .from(businessesTable)
      .where(and(eq(businessesTable.status, "approved"), eq(businessesTable.categoryId, lead.categoryId)))
      .limit(10);

    if (businesses.length > 0) {
      await db.insert(leadAssignmentsTable).values(
        businesses.map((b) => ({ leadId: lead.id, businessId: b.id }))
      );

      for (const biz of businesses) {
        if (!biz.ownerEmail) continue;
        sendEmail({
          to: biz.ownerEmail,
          subject: `🔔 New service request in your category`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#ea5c29">🔔 New Service Request</h2>
            <p>Someone is looking for services in your category on Hasanpur Connect.</p>
            <table style="width:100%;border-collapse:collapse;margin:12px 0">
              <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">What they need</td><td style="padding:8px;border:1px solid #e5e7eb">${lead.serviceRequest}</td></tr>
              <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Customer Name</td><td style="padding:8px;border:1px solid #e5e7eb">${lead.customerName}</td></tr>
              <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Customer Phone</td><td style="padding:8px;border:1px solid #e5e7eb">${lead.customerPhone}</td></tr>
            </table>
            <p><a href="${process.env.SITE_URL ?? ""}/dashboard" style="background:#ea5c29;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View in Dashboard →</a></p>
          </div>`,
        }).catch(() => {});
      }
    }
  }

  return res.json({ ...lead, createdAt: lead.createdAt?.toISOString() });
});

// Admin: reject lead
router.patch("/:id/reject", requireAdminAuth, async (req, res) => {
  const { adminNotes } = req.body;
  const [lead] = await db.update(leadsTable)
    .set({ status: "rejected", adminNotes: adminNotes || null })
    .where(eq(leadsTable.id, Number(req.params.id)))
    .returning();
  if (!lead) return res.status(404).json({ error: "Not found" });
  return res.json({ ...lead, createdAt: lead.createdAt?.toISOString() });
});

// Business owner: get leads assigned to their business
router.get("/for-business/:businessId", async (req, res) => {
  const assignments = await db.select().from(leadAssignmentsTable)
    .where(eq(leadAssignmentsTable.businessId, Number(req.params.businessId)))
    .orderBy(desc(leadAssignmentsTable.createdAt));
  const leadIds = assignments.map((a) => a.leadId);
  if (leadIds.length === 0) return res.json([]);
  const leads = await db.select().from(leadsTable);
  const leadMap = new Map(leads.map((l) => [l.id, l]));
  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map((c) => [c.id, c.name]));
  return res.json(assignments.map((a) => {
    const lead = leadMap.get(a.leadId);
    return {
      ...a, lead: lead ? {
        ...lead, categoryName: lead?.categoryId ? catMap.get(lead.categoryId) ?? null : null,
        createdAt: lead?.createdAt?.toISOString(),
      } : null,
      createdAt: a.createdAt?.toISOString(), respondedAt: a.respondedAt?.toISOString(),
    };
  }));
});

// Admin: view all assignments
router.get("/assignments", requireAdminAuth, async (_req, res) => {
  const assignments = await db.select().from(leadAssignmentsTable)
    .orderBy(desc(leadAssignmentsTable.createdAt));
  const leads = await db.select().from(leadsTable);
  const businesses = await db.select({ id: businessesTable.id, name: businessesTable.name }).from(businessesTable);
  const cats = await db.select().from(categoriesTable);
  const leadMap = new Map(leads.map((l) => [l.id, l]));
  const bizMap = new Map(businesses.map((b) => [b.id, b.name]));
  const catMap = new Map(cats.map((c) => [c.id, c.name]));
  return res.json(assignments.map((a) => {
    const lead = leadMap.get(a.leadId);
    return {
      ...a, businessName: bizMap.get(a.businessId) ?? null,
      lead: lead ? { ...lead, categoryName: lead.categoryId ? catMap.get(lead.categoryId) ?? null : null, createdAt: lead.createdAt?.toISOString() } : null,
      createdAt: a.createdAt?.toISOString(), respondedAt: a.respondedAt?.toISOString(),
    };
  }));
});

// Business/Admin: respond to lead assignment
router.patch("/assignments/:id/respond", async (req, res) => {
  const { status } = req.body;
  if (!["accepted", "rejected"].includes(status)) return res.status(400).json({ error: "status must be accepted or rejected" });
  const [assignment] = await db.update(leadAssignmentsTable)
    .set({ status, respondedAt: new Date() })
    .where(eq(leadAssignmentsTable.id, Number(req.params.id)))
    .returning();
  if (!assignment) return res.status(404).json({ error: "Not found" });
  return res.json({ ...assignment, createdAt: assignment.createdAt?.toISOString(), respondedAt: assignment.respondedAt?.toISOString() });
});

export default router;
