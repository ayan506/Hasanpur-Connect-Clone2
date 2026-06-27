import { Router } from "express";
import { db } from "@workspace/db";
import { popupsTable } from "@workspace/db";
import { eq, and, lte, gte, or, isNull } from "drizzle-orm";

const router = Router();

function serializePopup(p: typeof popupsTable.$inferSelect) {
  return {
    ...p,
    scheduleStart: p.scheduleStart?.toISOString() ?? null,
    scheduleEnd: p.scheduleEnd?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/all", async (_req, res) => {
  const rows = await db.select().from(popupsTable).orderBy(popupsTable.createdAt);
  return res.json(rows.map(serializePopup));
});

router.get("/", async (_req, res) => {
  const now = new Date();
  const rows = await db.select().from(popupsTable).where(
    and(
      eq(popupsTable.isEnabled, true),
      or(isNull(popupsTable.scheduleStart), lte(popupsTable.scheduleStart, now))!,
      or(isNull(popupsTable.scheduleEnd), gte(popupsTable.scheduleEnd, now))!,
    )
  );
  return res.json(rows.map(serializePopup));
});

router.post("/", async (req, res) => {
  const { title, description, type, imageUrl, buttonText, buttonUrl, bgColor, isEnabled, scheduleStart, scheduleEnd } = req.body;
  if (!title || !type) return res.status(400).json({ error: "title and type are required" });
  const [popup] = await db.insert(popupsTable).values({
    title, description, type, imageUrl, buttonText, buttonUrl, bgColor,
    isEnabled: isEnabled ?? true,
    scheduleStart: scheduleStart ? new Date(scheduleStart) : null,
    scheduleEnd: scheduleEnd ? new Date(scheduleEnd) : null,
  }).returning();
  return res.status(201).json(serializePopup(popup));
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const { title, description, type, imageUrl, buttonText, buttonUrl, bgColor, isEnabled, scheduleStart, scheduleEnd } = req.body;
  const updates: Partial<typeof popupsTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (type !== undefined) updates.type = type;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (buttonText !== undefined) updates.buttonText = buttonText;
  if (buttonUrl !== undefined) updates.buttonUrl = buttonUrl;
  if (bgColor !== undefined) updates.bgColor = bgColor;
  if (isEnabled !== undefined) updates.isEnabled = isEnabled;
  if (scheduleStart !== undefined) updates.scheduleStart = scheduleStart ? new Date(scheduleStart) : null;
  if (scheduleEnd !== undefined) updates.scheduleEnd = scheduleEnd ? new Date(scheduleEnd) : null;
  const [popup] = await db.update(popupsTable).set(updates).where(eq(popupsTable.id, id)).returning();
  if (!popup) return res.status(404).json({ error: "Not found" });
  return res.json(serializePopup(popup));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  await db.delete(popupsTable).where(eq(popupsTable.id, id));
  return res.status(204).send();
});

export default router;
