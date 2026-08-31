import { createHmac, timingSafeEqual } from "crypto";

function secret(): string {
  return process.env.NEXTAUTH_SECRET || process.env.TOKEN_ENCRYPTION_KEY || "dev-only-secret";
}

export function signOAuthState(userId: string): string {
  const payload = `${userId}.${Date.now()}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyOAuthState(state: string, maxAgeMs = 15 * 60 * 1000): string {
  const parts = state.split(".");
  if (parts.length !== 3) throw new Error("Invalid OAuth state");
  const [userId, ts, sig] = parts;
  const payload = `${userId}.${ts}`;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid OAuth state signature");
  }
  const age = Date.now() - Number(ts);
  if (!Number.isFinite(age) || age < 0 || age > maxAgeMs) {
    throw new Error("OAuth state expired");
  }
  return userId;
}
