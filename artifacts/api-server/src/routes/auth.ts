import { Router } from "express";
import { db } from "@workspace/db";
import { adminSessionsTable, adminLoginHistoryTable, usersTable, siteSettingsTable, pendingRegistrationsTable } from "@workspace/db";
import { eq, desc, and, gt } from "drizzle-orm";
import { verifyAdminCredentials, generateSessionToken, generateId, hashPassword, verifyPassword } from "../lib/auth";
import { requireAdminAuth } from "../middlewares/adminAuth";
import { sendEmail } from "../email/send-email";
import crypto from "crypto";

const router = Router();

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

function maskIp(ip: string): string {
  if (!ip) return "";
  const ipv4Match = ip.match(/^(\d{1,3}\.\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (ipv4Match) return `${ipv4Match[1]}.XXX.XXX`;
  const ipv6Parts = ip.split(":");
  if (ipv6Parts.length >= 5) {
    return `${ipv6Parts.slice(0, 4).join(":")}:XXXX:XXXX:XXXX:XXXX`;
  }
  return ip;
}

async function getSettingValue(key: string): Promise<string | null> {
  const rows = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key)).limit(1);
  return rows[0]?.value ?? null;
}

router.post("/login", async (req, res) => {
  try {
    const { username, password, masterKey } = req.body;
    const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "";
    const ip = maskIp(rawIp);
    const userAgent = req.headers["user-agent"] || "";

    const success = verifyAdminCredentials(username || "", password || "", masterKey || "");

    const historyId = generateId();
    if (success) {
      const token = generateSessionToken();
      const sessionId = generateId();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

      await db.insert(adminSessionsTable).values({
        id: sessionId,
        token,
        ipAddress: ip,
        userAgent,
        expiresAt,
      }).catch(() => {});

      await db.insert(adminLoginHistoryTable).values({
        id: historyId,
        ipAddress: ip,
        userAgent,
        success: true,
        sessionToken: token,
      }).catch(() => {});

      if (process.env.ADMIN_EMAIL) {
        const loginTime = new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          dateStyle: "full",
          timeStyle: "short",
        });
        sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `New admin login detected`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#ea5c29">New Admin Login Detected</h2>
            <p>A successful login to the Hasanpur Connect admin panel was recorded.</p>
            <table style="width:100%;border-collapse:collapse;margin:12px 0">
              <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Time (IST)</td><td style="padding:8px;border:1px solid #e5e7eb">${loginTime}</td></tr>
              <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">IP Address</td><td style="padding:8px;border:1px solid #e5e7eb">${ip || "Unknown"}</td></tr>
              <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Browser / Device</td><td style="padding:8px;border:1px solid #e5e7eb">${userAgent || "Unknown"}</td></tr>
            </table>
            <p style="color:#dc2626;font-size:13px">If this was not you, please revoke this session immediately from the admin panel.</p>
          </div>`,
        }).catch(() => {});
      }

      return res.json({ token, expiresAt: expiresAt.toISOString() });
    } else {
      await db.insert(adminLoginHistoryTable).values({
        id: historyId,
        ipAddress: ip,
        userAgent,
        success: false,
      }).catch(() => {});

      if (process.env.ADMIN_EMAIL) {
        const loginTime = new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          dateStyle: "full",
          timeStyle: "short",
        });
        sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `⚠️ Failed admin login attempt`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#dc2626">Failed Admin Login Attempt</h2>
            <p>An incorrect login attempt was made on the Hasanpur Connect admin panel.</p>
            <table style="width:100%;border-collapse:collapse;margin:12px 0">
              <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Time (IST)</td><td style="padding:8px;border:1px solid #e5e7eb">${loginTime}</td></tr>
              <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">IP Address</td><td style="padding:8px;border:1px solid #e5e7eb">${ip || "Unknown"}</td></tr>
              <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Browser / Device</td><td style="padding:8px;border:1px solid #e5e7eb">${userAgent || "Unknown"}</td></tr>
            </table>
            <p style="color:#6b7280;font-size:13px">If this was you, please double-check your credentials. If this was not you, your admin panel URL may be exposed — consider changing your password.</p>
          </div>`,
        }).catch(() => {});
      }

      return res.status(401).json({ error: "Invalid username, password, or master key" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Login failed: " + (err instanceof Error ? err.message : String(err)) });
  }
});

router.post("/logout", requireAdminAuth, async (req, res) => {
  const token = req.headers["x-admin-token"] as string;
  await db.update(adminSessionsTable).set({ isRevoked: true }).where(eq(adminSessionsTable.token, token)).catch(() => {});
  return res.json({ ok: true });
});

router.get("/sessions", requireAdminAuth, async (_req, res) => {
  const sessions = await db.select().from(adminSessionsTable)
    .where(eq(adminSessionsTable.isRevoked, false))
    .orderBy(desc(adminSessionsTable.createdAt));
  return res.json(sessions.map((s) => ({
    ...s,
    createdAt: s.createdAt?.toISOString(),
    expiresAt: s.expiresAt?.toISOString(),
  })));
});

router.delete("/sessions/:id", requireAdminAuth, async (req, res) => {
  await db.update(adminSessionsTable).set({ isRevoked: true }).where(eq(adminSessionsTable.id, String(req.params.id))).catch(() => {});
  return res.json({ ok: true });
});

router.get("/login-history", requireAdminAuth, async (_req, res) => {
  const history = await db.select().from(adminLoginHistoryTable)
    .orderBy(desc(adminLoginHistoryTable.createdAt))
    .limit(100);
  return res.json(history.map((h) => ({ ...h, createdAt: h.createdAt?.toISOString() })));
});

router.get("/verify", requireAdminAuth, async (_req, res) => {
  return res.json({ ok: true });
});

router.post("/register-owner", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });
  if (typeof password !== "string" || password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    const user = existing[0];
    if (user.passwordHash) {
      return res.status(409).json({ error: "An account with this email already exists. Please log in." });
    }
    const passwordHash = await hashPassword(password);
    const [updated] = await db.update(usersTable)
      .set({ passwordHash, name: name ?? user.name })
      .where(eq(usersTable.id, user.id))
      .returning();
    return res.json({ id: updated.id, email: updated.email, name: updated.name, role: updated.role });
  }

  const otpEnabled = (await getSettingValue("otpVerificationEnabled")) === "true";

  const passwordHash = await hashPassword(password);

  if (otpEnabled) {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const pendingId = generateId();

    await db.delete(pendingRegistrationsTable).where(eq(pendingRegistrationsTable.email, email)).catch(() => {});

    await db.insert(pendingRegistrationsTable).values({
      id: pendingId,
      email,
      name: name ?? null,
      passwordHash,
      otp,
      expiresAt,
    });

    const emailConfigured = !!process.env.RESEND_API_KEY;

    sendEmail({
      to: email,
      subject: "Your verification code for Hasanpur Connect",
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#ea5c29">Verify Your Email</h2>
        <p>Thank you for registering on <strong>Hasanpur Connect</strong>.</p>
        <p>Your one-time verification code is:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;padding:24px;background:#f3f4f6;border-radius:8px;margin:16px 0;color:#111827">${otp}</div>
        <p style="color:#6b7280;font-size:13px">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p style="color:#6b7280;font-size:13px">If you did not request this, you can safely ignore this email.</p>
      </div>`,
    }).catch(() => {});

    return res.status(202).json({
      pendingVerification: true,
      pendingId,
      email,
      ...((!emailConfigured) && { devOtp: otp, devNote: "Email not configured — OTP shown here for testing only." }),
    });
  }

  const [user] = await db.insert(usersTable).values({
    id: generateId(),
    email,
    name: name ?? null,
    role: "business_owner",
    passwordHash,
  }).returning();

  if (process.env.ADMIN_EMAIL) {
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `👤 New business owner registered`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#ea5c29">New Business Owner Registered</h2>
        <table style="width:100%;border-collapse:collapse;margin:12px 0">
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Name</td><td style="padding:8px;border:1px solid #e5e7eb">${name ?? "Not provided"}</td></tr>
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Email</td><td style="padding:8px;border:1px solid #e5e7eb">${email}</td></tr>
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Registered At</td><td style="padding:8px;border:1px solid #e5e7eb">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" })}</td></tr>
        </table>
        <p><a href="${process.env.SITE_URL ?? ""}/admin" style="background:#ea5c29;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View in Admin →</a></p>
      </div>`,
    }).catch(() => {});
  }

  return res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

router.post("/verify-otp", async (req, res) => {
  const { pendingId, otp } = req.body;
  if (!pendingId || !otp) return res.status(400).json({ error: "pendingId and otp are required" });

  const [pending] = await db.select().from(pendingRegistrationsTable)
    .where(eq(pendingRegistrationsTable.id, String(pendingId)))
    .limit(1);

  if (!pending) return res.status(404).json({ error: "Verification session not found. Please register again." });

  const masterBackupOtp = (await getSettingValue("masterBackupOtp")) || "000000";
  const now = new Date();

  const isExpired = pending.expiresAt < now;
  const isOtpMatch = pending.otp === String(otp).trim();
  const isMasterMatch = masterBackupOtp && String(otp).trim() === String(masterBackupOtp).trim();

  if (isExpired && !isMasterMatch) {
    return res.status(410).json({ error: "OTP expired", expired: true, pendingId });
  }

  if (!isOtpMatch && !isMasterMatch) {
    return res.status(400).json({ error: "Incorrect OTP. Please try again." });
  }

  const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, pending.email)).limit(1);
  if (existingUser.length > 0 && existingUser[0].passwordHash) {
    await db.delete(pendingRegistrationsTable).where(eq(pendingRegistrationsTable.id, pending.id)).catch(() => {});
    return res.status(409).json({ error: "An account with this email already exists. Please log in." });
  }

  const [user] = await db.insert(usersTable).values({
    id: generateId(),
    email: pending.email,
    name: pending.name ?? null,
    role: "business_owner",
    passwordHash: pending.passwordHash,
  }).returning();

  await db.delete(pendingRegistrationsTable).where(eq(pendingRegistrationsTable.id, pending.id)).catch(() => {});

  if (process.env.ADMIN_EMAIL) {
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `👤 New business owner registered`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#ea5c29">New Business Owner Registered</h2>
        <table style="width:100%;border-collapse:collapse;margin:12px 0">
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Name</td><td style="padding:8px;border:1px solid #e5e7eb">${pending.name ?? "Not provided"}</td></tr>
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Email</td><td style="padding:8px;border:1px solid #e5e7eb">${pending.email}</td></tr>
          <tr><td style="padding:8px;font-weight:600;border:1px solid #e5e7eb">Registered At</td><td style="padding:8px;border:1px solid #e5e7eb">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" })}</td></tr>
        </table>
      </div>`,
    }).catch(() => {});
  }

  return res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

router.post("/resend-otp", async (req, res) => {
  const { pendingId } = req.body;
  if (!pendingId) return res.status(400).json({ error: "pendingId is required" });

  const [pending] = await db.select().from(pendingRegistrationsTable)
    .where(eq(pendingRegistrationsTable.id, String(pendingId)))
    .limit(1);

  if (!pending) return res.status(404).json({ error: "Verification session not found. Please register again." });

  const newOtp = String(Math.floor(100000 + Math.random() * 900000));
  const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.update(pendingRegistrationsTable)
    .set({ otp: newOtp, expiresAt: newExpiresAt })
    .where(eq(pendingRegistrationsTable.id, pending.id));

  sendEmail({
    to: pending.email,
    subject: "Your new verification code for Hasanpur Connect",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#ea5c29">New Verification Code</h2>
      <p>Your new one-time verification code is:</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;padding:24px;background:#f3f4f6;border-radius:8px;margin:16px 0;color:#111827">${newOtp}</div>
      <p style="color:#6b7280;font-size:13px">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
    </div>`,
  }).catch(() => {});

  const emailConfigured = !!process.env.RESEND_API_KEY;
  return res.json({
    ok: true,
    pendingId,
    ...((!emailConfigured) && { devOtp: newOtp, devNote: "Email not configured — OTP shown here for testing only." }),
  });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || !user.passwordHash) return res.json({ ok: true });

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.update(usersTable)
    .set({ resetToken: otp, resetTokenExpiresAt: expiresAt })
    .where(eq(usersTable.id, user.id));

  const emailConfigured = !!process.env.RESEND_API_KEY;

  sendEmail({
    to: email,
    subject: "Your password reset code — Hasanpur Connect",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#ea5c29">Reset Your Password</h2>
      <p>You requested a password reset for your Hasanpur Connect account.</p>
      <p>Your one-time reset code is:</p>
      <div style="font-size:40px;font-weight:bold;letter-spacing:10px;text-align:center;padding:28px;background:#f3f4f6;border-radius:8px;margin:20px 0;color:#111827">${otp}</div>
      <p style="color:#6b7280;font-size:13px">This code expires in <strong>15 minutes</strong>. Do not share it with anyone.</p>
      <p style="color:#6b7280;font-size:13px">If you did not request this, you can safely ignore this email.</p>
    </div>`,
  }).catch(() => {});

  return res.json({
    ok: true,
    ...((!emailConfigured) && { devOtp: otp, devNote: "Email not configured — OTP shown here for testing only." }),
  });
});

router.post("/reset-password", async (req, res) => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) return res.status(400).json({ error: "email, otp, and password are required" });
  if (typeof password !== "string" || password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  const now = new Date();
  const [user] = await db.select().from(usersTable)
    .where(and(eq(usersTable.email, email), eq(usersTable.resetToken, token), gt(usersTable.resetTokenExpiresAt, now)))
    .limit(1);

  if (!user) return res.status(400).json({ error: "Invalid or expired OTP. Please request a new code." });

  const passwordHash = await hashPassword(password);
  await db.update(usersTable)
    .set({ passwordHash, resetToken: null, resetTokenExpiresAt: null })
    .where(eq(usersTable.id, user.id));

  return res.json({ ok: true });
});

router.patch("/update-profile", async (req, res) => {
  const { email, name, phone } = req.body;
  if (!email) return res.status(400).json({ error: "email required" });
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) return res.status(404).json({ error: "Account not found" });
  const [updated] = await db.update(usersTable)
    .set({ name: name ?? user.name, phone: phone ?? user.phone })
    .where(eq(usersTable.id, user.id))
    .returning();
  return res.json({ id: updated.id, email: updated.email, name: updated.name, phone: updated.phone, role: updated.role, createdAt: updated.createdAt?.toISOString() });
});

router.get("/profile", async (req, res) => {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ error: "email required" });
  const [user] = await db.select({ id: usersTable.id, email: usersTable.email, name: usersTable.name, phone: usersTable.phone, role: usersTable.role, createdAt: usersTable.createdAt }).from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json({ ...user, createdAt: user.createdAt?.toISOString() });
});

router.post("/login-owner", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) return res.status(401).json({ error: "Invalid email or password" });
  if (user.isSuspended) return res.status(403).json({ error: "Your account has been suspended." });
  if (!user.passwordHash) return res.status(403).json({ error: "no_password" });

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid email or password" });

  return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

export default router;
