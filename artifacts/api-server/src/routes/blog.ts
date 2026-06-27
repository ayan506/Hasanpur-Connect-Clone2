import { Router } from "express";
import { db } from "@workspace/db";
import { blogPostsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import {
  CreateBlogPostBody, UpdateBlogPostBody, UpdateBlogPostParams,
  DeleteBlogPostParams, GetBlogPostParams, ListBlogPostsQueryParams,
} from "@workspace/api-zod";

const router = Router();

function serialize(p: typeof blogPostsTable.$inferSelect) {
  return {
    id: p.id, title: p.title, slug: p.slug, content: p.content, excerpt: p.excerpt,
    featuredImage: p.featuredImage, category: p.category,
    tags: p.tagsJson ? JSON.parse(p.tagsJson) : [],
    status: p.status, metaTitle: p.metaTitle, metaDescription: p.metaDescription,
    authorName: p.authorName,
    createdAt: p.createdAt?.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
  };
}

function buildSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

router.get("/", async (req, res) => {
  const parsed = ListBlogPostsQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query" });
  const { status = "published", page = 1, limit = 10 } = parsed.data;
  const where = (!status || status === "all") ? undefined : eq(blogPostsTable.status, status);
  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(blogPostsTable).where(where);
  const rows = await db.select().from(blogPostsTable).where(where)
    .orderBy(desc(blogPostsTable.createdAt))
    .limit(limit ?? 10).offset(((page ?? 1) - 1) * (limit ?? 10));
  return res.json({ posts: rows.map(serialize), total, page: page ?? 1, limit: limit ?? 10 });
});

router.get("/:slug", async (req, res) => {
  const p = GetBlogPostParams.safeParse(req.params);
  if (!p.success) return res.status(400).json({ error: "Invalid" });
  const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, p.data.slug));
  if (!post) return res.status(404).json({ error: "Not found" });
  return res.json(serialize(post));
});

router.post("/", async (req, res) => {
  const parsed = CreateBlogPostBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { title, content, excerpt, featuredImage, category, tags, status, metaTitle, metaDescription } = parsed.data;
  let slug = buildSlug(title);
  const existing = await db.select({ slug: blogPostsTable.slug }).from(blogPostsTable).where(eq(blogPostsTable.slug, slug));
  if (existing.length > 0) slug = `${slug}-${Date.now()}`;
  const [post] = await db.insert(blogPostsTable).values({
    title, slug, content, excerpt, featuredImage, category,
    tagsJson: tags ? JSON.stringify(tags) : null,
    status: status ?? "draft", metaTitle, metaDescription,
  }).returning();
  return res.status(201).json(serialize(post));
});

router.put("/:id", async (req, res) => {
  const p = UpdateBlogPostParams.safeParse(req.params);
  const body = UpdateBlogPostBody.safeParse(req.body);
  if (!p.success || !body.success) return res.status(400).json({ error: "Invalid input" });
  const updates: Partial<typeof blogPostsTable.$inferInsert> = { ...body.data };
  if (body.data.tags) updates.tagsJson = JSON.stringify(body.data.tags);
  delete (updates as any).tags;
  const [post] = await db.update(blogPostsTable).set(updates).where(eq(blogPostsTable.id, p.data.id)).returning();
  if (!post) return res.status(404).json({ error: "Not found" });
  return res.json(serialize(post));
});

router.delete("/:id", async (req, res) => {
  const p = DeleteBlogPostParams.safeParse(req.params);
  if (!p.success) return res.status(400).json({ error: "Invalid" });
  await db.delete(blogPostsTable).where(eq(blogPostsTable.id, p.data.id));
  return res.status(204).send();
});

export default router;
