import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, businessesTable, notificationsTable } from "@workspace/db";
import { eq, and, or, ilike, sql } from "drizzle-orm";
import { CreateProductBody, UpdateProductBody, UpdateProductParams, DeleteProductParams, ListProductsQueryParams } from "@workspace/api-zod";
import { requireAdminAuth } from "../middlewares/adminAuth";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query" });
  const where = parsed.data.businessId ? eq(productsTable.businessId, parsed.data.businessId) : undefined;
  const rows = await db.select().from(productsTable).where(where);
  return res.json(rows.map((p) => ({ ...p, createdAt: p.createdAt?.toISOString() })));
});

router.post("/", async (req, res) => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { businessId } = parsed.data;

  // Enforce product limit
  const [biz] = await db.select().from(businessesTable).where(eq(businessesTable.id, businessId));
  if (!biz) return res.status(404).json({ error: "Business not found" });
  const limit = biz.productLimit ?? 5;
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(eq(productsTable.businessId, businessId));
  if (count >= limit) return res.status(400).json({ error: "Product limit reached" });

  const [product] = await db.insert(productsTable).values({
    ...parsed.data,
    status: "pending",
  }).returning();

  // Notify admin of new pending product
  try {
    await db.insert(notificationsTable).values({
      type: "new_product",
      title: "New product submitted",
      body: `${biz.name} submitted a new product: ${parsed.data.name}`,
      entityType: "product",
      entityId: product.id,
      isRead: false,
    });
  } catch {}

  return res.status(201).json({ ...product, createdAt: product.createdAt?.toISOString() });
});

router.put("/:id", async (req, res) => {
  const p = UpdateProductParams.safeParse(req.params);
  const body = UpdateProductBody.safeParse(req.body);
  if (!p.success || !body.success) return res.status(400).json({ error: "Invalid input" });
  const [product] = await db.update(productsTable).set(body.data).where(eq(productsTable.id, p.data.id)).returning();
  if (!product) return res.status(404).json({ error: "Not found" });
  return res.json({ ...product, createdAt: product.createdAt?.toISOString() });
});

router.delete("/:id", async (req, res) => {
  const p = DeleteProductParams.safeParse(req.params);
  if (!p.success) return res.status(400).json({ error: "Invalid" });
  await db.delete(productsTable).where(eq(productsTable.id, p.data.id));
  return res.status(204).send();
});

// Admin: search business by ID (HC-000001 format or plain number) or owner email
router.get("/admin/search", requireAdminAuth, async (req, res) => {
  const { q } = req.query as { q?: string };
  if (!q) return res.json([]);

  const stripped = q.replace(/^HC-?0*/i, "").trim();
  const numericId = /^\d+$/.test(stripped) ? Number(stripped) : null;
  const isEmailSearch = q.includes("@");

  let businesses: any[] = [];
  if (numericId) {
    businesses = await db.select().from(businessesTable).where(eq(businessesTable.id, numericId)).limit(1);
  } else if (isEmailSearch) {
    businesses = await db.select().from(businessesTable).where(ilike(businessesTable.ownerEmail, `%${q}%`)).limit(10);
  } else {
    businesses = await db.select().from(businessesTable).where(ilike(businessesTable.name, `%${q}%`)).limit(10);
  }

  const results = await Promise.all(businesses.map(async (biz) => {
    const products = await db.select().from(productsTable).where(eq(productsTable.businessId, biz.id));
    return {
      id: biz.id,
      name: biz.name,
      ownerEmail: biz.ownerEmail,
      status: biz.status,
      isPremium: biz.isPremium,
      productLimit: biz.productLimit ?? 5,
      productCount: products.length,
      products: products.map(p => ({ ...p, createdAt: p.createdAt?.toISOString() })),
    };
  }));

  return res.json(results);
});

// Admin: update product limit for a business
router.patch("/admin/:businessId/limit", requireAdminAuth, async (req, res) => {
  const { delta, setTo } = req.body;
  const bizId = Number(req.params.businessId);
  if (!bizId) return res.status(400).json({ error: "Invalid businessId" });

  const [biz] = await db.select().from(businessesTable).where(eq(businessesTable.id, bizId));
  if (!biz) return res.status(404).json({ error: "Business not found" });

  let newLimit: number;
  if (typeof setTo === "number") {
    newLimit = Math.max(0, setTo);
  } else if (typeof delta === "number") {
    newLimit = Math.max(0, (biz.productLimit ?? 5) + delta);
  } else {
    return res.status(400).json({ error: "Provide delta or setTo" });
  }

  const [updated] = await db.update(businessesTable)
    .set({ productLimit: newLimit })
    .where(eq(businessesTable.id, bizId))
    .returning({ id: businessesTable.id, name: businessesTable.name, productLimit: businessesTable.productLimit });

  return res.json(updated);
});

// Admin: list all pending products
router.get("/admin/pending", requireAdminAuth, async (req, res) => {
  const rows = await db
    .select({ product: productsTable, businessName: businessesTable.name, businessId: businessesTable.id })
    .from(productsTable)
    .innerJoin(businessesTable, eq(productsTable.businessId, businessesTable.id))
    .where(eq(productsTable.status, "pending"))
    .orderBy(productsTable.id);
  return res.json(rows.map(r => ({
    ...r.product,
    businessName: r.businessName,
    createdAt: r.product.createdAt?.toISOString(),
  })));
});

// Admin: approve or reject a product
router.patch("/admin/:id/status", requireAdminAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const { action } = req.body;
  if (!["approve", "reject"].includes(action)) return res.status(400).json({ error: "action must be approve or reject" });
  const newStatus = action === "approve" ? "approved" : "rejected";
  const [product] = await db.update(productsTable).set({ status: newStatus }).where(eq(productsTable.id, id)).returning();
  if (!product) return res.status(404).json({ error: "Not found" });
  return res.json({ ...product, createdAt: product.createdAt?.toISOString() });
});

// Admin: add a product to any business directly (approved immediately)
router.post("/admin/add", requireAdminAuth, async (req, res) => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const [product] = await db.insert(productsTable).values({
    ...parsed.data,
    status: "approved",
  }).returning();
  return res.status(201).json({ ...product, createdAt: product.createdAt?.toISOString() });
});

// Admin: update / edit any product
router.patch("/admin/:id/edit", requireAdminAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const body = UpdateProductBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid input" });
  const [product] = await db.update(productsTable).set(body.data).where(eq(productsTable.id, id)).returning();
  if (!product) return res.status(404).json({ error: "Not found" });
  return res.json({ ...product, createdAt: product.createdAt?.toISOString() });
});

export default router;
