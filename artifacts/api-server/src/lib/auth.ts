import crypto from "crypto";

export function generateId(): string {
  return crypto.randomUUID();
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ":" + derivedKey.toString("hex"));
    });
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(":");
    if (!salt || !key) resolve(false);
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString("hex"));
    });
  });
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_MASTER_KEY = process.env.ADMIN_MASTER_KEY;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_MASTER_KEY) {
  throw new Error(
    "ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_MASTER_KEY environment variables are required. " +
    "Please set them in Replit Secrets before starting the server."
  );
}

export function verifyAdminCredentials(
  username: string,
  password: string,
  masterKey: string
): boolean {
  const usernameMatch = username === ADMIN_USERNAME;
  const passwordMatch = password === ADMIN_PASSWORD;
  const masterKeyMatch = masterKey === ADMIN_MASTER_KEY;
  return usernameMatch && passwordMatch && masterKeyMatch;
}
