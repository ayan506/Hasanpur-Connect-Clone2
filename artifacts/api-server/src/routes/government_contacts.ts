import { Router } from "express";
import { db } from "@workspace/db";
import { governmentContactsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdminAuth } from "../middlewares/adminAuth";

const router = Router();

router.get("/", async (_req, res) => {
  const contacts = await db.select().from(governmentContactsTable)
    .orderBy(asc(governmentContactsTable.sortOrder));
  return res.json(contacts.map((c) => ({ ...c, createdAt: c.createdAt?.toISOString() })));
});

router.post("/", requireAdminAuth, async (req, res) => {
  const { name, designation, phone, sortOrder } = req.body;
  if (!name || !designation || !phone) return res.status(400).json({ error: "name, designation, phone required" });
  const [contact] = await db.insert(governmentContactsTable).values({ name, designation, phone, sortOrder: sortOrder ?? 0 }).returning();
  return res.status(201).json({ ...contact, createdAt: contact.createdAt?.toISOString() });
});

router.put("/:id", requireAdminAuth, async (req, res) => {
  const { name, designation, phone, sortOrder } = req.body;
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (designation !== undefined) updates.designation = designation;
  if (phone !== undefined) updates.phone = phone;
  if (sortOrder !== undefined) updates.sortOrder = sortOrder;
  const [contact] = await db.update(governmentContactsTable).set(updates).where(eq(governmentContactsTable.id, Number(req.params.id))).returning();
  if (!contact) return res.status(404).json({ error: "Not found" });
  return res.json({ ...contact, createdAt: contact.createdAt?.toISOString() });
});

router.delete("/:id", requireAdminAuth, async (req, res) => {
  await db.delete(governmentContactsTable).where(eq(governmentContactsTable.id, Number(req.params.id)));
  return res.status(204).send();
});

export default router;
