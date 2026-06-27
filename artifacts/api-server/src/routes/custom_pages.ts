import { Router } from "express";
import { db } from "@workspace/db";
import { customPagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdminAuth } from "../middlewares/adminAuth";

const router = Router();

router.get("/", async (_req, res) => {
  const pages = await db.select().from(customPagesTable)
    .where(eq(customPagesTable.status, "published"));
  return res.json(pages.map((p) => ({ ...p, createdAt: p.createdAt?.toISOString(), updatedAt: p.updatedAt?.toISOString() })));
});

router.get("/all", requireAdminAuth, async (_req, res) => {
  const pages = await db.select().from(customPagesTable);
  return res.json(pages.map((p) => ({ ...p, createdAt: p.createdAt?.toISOString(), updatedAt: p.updatedAt?.toISOString() })));
});

router.get("/:slug", async (req, res) => {
  const [page] = await db.select().from(customPagesTable).where(eq(customPagesTable.slug, req.params.slug));
  if (!page || page.status !== "published") return res.status(404).json({ error: "Not found" });
  return res.json({ ...page, createdAt: page.createdAt?.toISOString(), updatedAt: page.updatedAt?.toISOString() });
});

router.post("/", requireAdminAuth, async (req, res) => {
  const { title, slug, content, metaTitle, metaDescription, coverImage, galleryJson } = req.body;
  if (!title || !slug) return res.status(400).json({ error: "title and slug required" });
  const [page] = await db.insert(customPagesTable).values({
    title, slug, content: content || "", metaTitle, metaDescription,
    status: "published", showInNav: false, footerSection: null,
    coverImage: coverImage || null,
    ...(galleryJson !== undefined ? { galleryJson } : {}),
  } as any).returning();
  return res.status(201).json({ ...page, createdAt: page.createdAt?.toISOString(), updatedAt: page.updatedAt?.toISOString() });
});

router.put("/:id", requireAdminAuth, async (req, res) => {
  const { title, slug, content, metaTitle, metaDescription, coverImage, galleryJson } = req.body;
  const updates: any = { updatedAt: new Date(), status: "published" };
  if (title !== undefined) updates.title = title;
  if (slug !== undefined) updates.slug = slug;
  if (content !== undefined) updates.content = content;
  if (metaTitle !== undefined) updates.metaTitle = metaTitle;
  if (metaDescription !== undefined) updates.metaDescription = metaDescription;
  if (coverImage !== undefined) updates.coverImage = coverImage;
  if (galleryJson !== undefined) updates.galleryJson = galleryJson;
  const [page] = await db.update(customPagesTable).set(updates).where(eq(customPagesTable.id, Number(req.params.id))).returning();
  if (!page) return res.status(404).json({ error: "Not found" });
  return res.json({ ...page, createdAt: page.createdAt?.toISOString(), updatedAt: page.updatedAt?.toISOString() });
});

router.delete("/:id", requireAdminAuth, async (req, res) => {
  await db.delete(customPagesTable).where(eq(customPagesTable.id, Number(req.params.id)));
  return res.status(204).send();
});

export default router;
