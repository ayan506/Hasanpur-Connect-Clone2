import { Router } from "express";
import { db } from "@workspace/db";
import {
  businessesTable, enquiriesTable, reviewsTable, webdevEnquiriesTable,
  businessReportsTable, searchQueriesTable, usersTable
} from "@workspace/db";
import { requireAdminAuth } from "../middlewares/adminAuth";
import { desc } from "drizzle-orm";

const router = Router();

router.use(requireAdminAuth);

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v instanceof Date ? v.toISOString() : v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map(h => escape(row[h])).join(","));
  return lines.join("\r\n");
}

function sendCSV(res: any, data: Record<string, unknown>[], filename: string) {
  const csv = toCSV(data);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  return res.send("\uFEFF" + csv);
}

router.get("/businesses", async (_req, res) => {
  const rows = await db.select().from(businessesTable).orderBy(desc(businessesTable.createdAt));
  return sendCSV(res, rows.map(b => ({
    id: b.id, name: b.name, slug: b.slug, categoryId: b.categoryId,
    status: b.status, phone: b.phone, email: b.email,
    address: b.address, pinCode: b.pinCode, ownerEmail: b.ownerEmail,
    isFeatured: b.isFeatured, isPremium: b.isPremium, isVerified: b.isVerified,
    createdAt: b.createdAt?.toISOString(),
  })), "businesses.csv");
});

router.get("/enquiries", async (_req, res) => {
  const rows = await db.select().from(enquiriesTable).orderBy(desc(enquiriesTable.createdAt));
  return sendCSV(res, rows.map(e => ({
    id: e.id, businessId: e.businessId, name: e.name, email: e.email,
    phone: e.phone, message: e.message, createdAt: e.createdAt?.toISOString(),
  })), "enquiries.csv");
});

router.get("/reviews", async (_req, res) => {
  const rows = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt));
  return sendCSV(res, rows.map(r => ({
    id: r.id, businessId: r.businessId, reviewerName: r.reviewerName,
    reviewerEmail: r.reviewerEmail, rating: r.rating, content: r.content,
    status: r.status, createdAt: r.createdAt?.toISOString(),
  })), "reviews.csv");
});

router.get("/webdev-enquiries", async (_req, res) => {
  const rows = await db.select().from(webdevEnquiriesTable).orderBy(desc(webdevEnquiriesTable.createdAt));
  return sendCSV(res, rows.map(w => ({
    id: w.id, name: w.name, phone: w.phone,
    businessName: w.businessName, businessType: w.businessType,
    budget: w.budget, message: w.message, createdAt: w.createdAt?.toISOString(),
  })), "webdev-leads.csv");
});

router.get("/business-reports", async (_req, res) => {
  const rows = await db.select().from(businessReportsTable).orderBy(desc(businessReportsTable.createdAt));
  return sendCSV(res, rows.map(r => ({
    id: r.id, businessId: r.businessId, reason: r.reason,
    description: r.description, reporterName: r.reporterName,
    status: r.status, createdAt: r.createdAt?.toISOString(),
  })), "business-reports.csv");
});

router.get("/search-queries", async (_req, res) => {
  const rows = await db.select().from(searchQueriesTable).orderBy(desc(searchQueriesTable.createdAt)).limit(5000);
  return sendCSV(res, rows.map(q => ({
    id: q.id, query: q.query, resultsCount: q.resultsCount,
    sessionId: q.sessionId, createdAt: q.createdAt?.toISOString(),
  })), "search-queries.csv");
});

router.get("/users", async (_req, res) => {
  const rows = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  return sendCSV(res, rows.map(u => ({
    id: u.id, email: u.email, name: u.name, role: u.role,
    isSuspended: u.isSuspended, createdAt: u.createdAt?.toISOString(),
  })), "users.csv");
});

export default router;
