import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function makeApiKey() {
  const raw = `sentra_live_${randomBytes(32).toString("base64url")}`;
  return { raw, hash: sha256(raw), prefix: raw.slice(0, 17) };
}
export function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

// A database bucket survives Vercel cold starts and is shared by all function instances.
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
) {
  const id = sha256(key);
  const now = new Date();
  const expiry = new Date(now.getTime() + windowSeconds * 1000);
  const bucket = await prisma.rateBucket.upsert({
    where: { key: id },
    create: { key: id, count: 1, expiresAt: expiry },
    update: { count: { increment: 1 } },
  });
  if (bucket.expiresAt <= now) {
    await prisma.rateBucket.update({
      where: { key: id },
      data: { count: 1, expiresAt: expiry },
    });
    return true;
  }
  return bucket.count <= limit;
}

export function clientIp(request: NextRequest) {
  // Vercel sets this header at the edge. It is a hint for throttling, never for authorization.
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return (
      new URL(origin).host === request.nextUrl.host &&
      new URL(origin).protocol === request.nextUrl.protocol
    );
  } catch {
    return false;
  }
}
