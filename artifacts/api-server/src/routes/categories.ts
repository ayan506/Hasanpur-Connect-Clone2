import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, businessesTable } from "@workspace/db";
import { eq, sql, asc } from "drizzle-orm";
import { CreateCategoryBody, UpdateCategoryBody, UpdateCategoryParams, DeleteCategoryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (_req, res) => {
  const cats = await db.select().from(categoriesTable).orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name));
  const counts = await db
    .select({ categoryId: businessesTable.categoryId, count: sql<number>`count(*)::int` })
    .from(businessesTable)
    .where(eq(businessesTable.status, "approved"))
    .groupBy(businessesTable.categoryId);
  const countMap = new Map(counts.map((c) => [c.categoryId, c.count]));
  return res.json(cats.map((c) => ({ ...c, businessCount: countMap.get(c.id) ?? 0 })));
});

router.post("/", async (req, res) => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { name, icon, description, isFeatured, sortOrder } = parsed.data as any;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const [cat] = await db.insert(categoriesTable).values({ name, slug, icon, description, isFeatured: isFeatured ?? false, sortOrder: sortOrder ?? 0 }).returning();
  return res.status(201).json({ ...cat, businessCount: 0 });
});

router.put("/:id", async (req, res) => {
  const p = UpdateCategoryParams.safeParse(req.params);
  const b = UpdateCategoryBody.safeParse(req.body);
  if (!p.success || !b.success) return res.status(400).json({ error: "Invalid input" });
  const { name, icon, description, isFeatured, sortOrder } = b.data as any;
  const updates: Partial<typeof categoriesTable.$inferInsert> = {};
  if (name) { updates.name = name; updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
  if (icon) updates.icon = icon;
  if (description !== undefined) updates.description = description;
  if (isFeatured !== undefined) updates.isFeatured = isFeatured;
  if (sortOrder !== undefined) updates.sortOrder = sortOrder;
  const [cat] = await db.update(categoriesTable).set(updates).where(eq(categoriesTable.id, p.data.id)).returning();
  if (!cat) return res.status(404).json({ error: "Not found" });
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(businessesTable).where(eq(businessesTable.categoryId, cat.id));
  return res.json({ ...cat, businessCount: count });
});

router.delete("/:id", async (req, res) => {
  const p = DeleteCategoryParams.safeParse(req.params);
  if (!p.success) return res.status(400).json({ error: "Invalid input" });
  await db.delete(categoriesTable).where(eq(categoriesTable.id, p.data.id));
  return res.status(204).send();
});

export default router;
