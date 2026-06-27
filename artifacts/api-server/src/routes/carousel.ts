import { Router } from "express";
import { db } from "@workspace/db";
import { carouselSlidesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdminAuth } from "../middlewares/adminAuth";

const router = Router();

router.get("/", async (_req, res) => {
  const slides = await db.select().from(carouselSlidesTable)
    .where(eq(carouselSlidesTable.isActive, true))
    .orderBy(asc(carouselSlidesTable.sortOrder));
  return res.json(slides.map((s) => ({ ...s, createdAt: s.createdAt?.toISOString() })));
});

router.get("/all", requireAdminAuth, async (_req, res) => {
  const slides = await db.select().from(carouselSlidesTable)
    .orderBy(asc(carouselSlidesTable.sortOrder));
  return res.json(slides.map((s) => ({ ...s, createdAt: s.createdAt?.toISOString() })));
});

router.post("/", requireAdminAuth, async (req, res) => {
  const { imageUrl, title, subtitle, linkUrl, sortOrder, isActive } = req.body;
  if (!imageUrl) return res.status(400).json({ error: "imageUrl required" });
  const [slide] = await db.insert(carouselSlidesTable).values({
    imageUrl,
    title: title || null,
    subtitle: subtitle || null,
    linkUrl: linkUrl || null,
    sortOrder: sortOrder ?? 0,
    isActive: isActive !== false,
  }).returning();
  return res.status(201).json({ ...slide, createdAt: slide.createdAt?.toISOString() });
});

router.put("/:id", requireAdminAuth, async (req, res) => {
  const { imageUrl, title, subtitle, linkUrl, sortOrder, isActive } = req.body;
  const updates: any = {};
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (title !== undefined) updates.title = title;
  if (subtitle !== undefined) updates.subtitle = subtitle;
  if (linkUrl !== undefined) updates.linkUrl = linkUrl;
  if (sortOrder !== undefined) updates.sortOrder = sortOrder;
  if (isActive !== undefined) updates.isActive = isActive;
  const [slide] = await db.update(carouselSlidesTable).set(updates).where(eq(carouselSlidesTable.id, Number(req.params.id))).returning();
  if (!slide) return res.status(404).json({ error: "Not found" });
  return res.json({ ...slide, createdAt: slide.createdAt?.toISOString() });
});

router.delete("/:id", requireAdminAuth, async (req, res) => {
  await db.delete(carouselSlidesTable).where(eq(carouselSlidesTable.id, Number(req.params.id)));
  return res.status(204).send();
});

export default router;
