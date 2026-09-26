import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ApiError, jsonError } from "@/lib/api";
import { safeEqual } from "@/lib/security";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (
      !secret ||
      !safeEqual(request.headers.get("authorization") ?? "", `Bearer ${secret}`)
    )
      throw new ApiError(401, "UNAUTHORIZED", "Invalid cron authorization");
    const now = new Date();
    const [buckets, resets] = await Promise.all([
      prisma.rateBucket.deleteMany({ where: { expiresAt: { lt: now } } }),
      prisma.passwordResetToken.deleteMany({
        where: { expiresAt: { lt: now } },
      }),
    ]);
    return NextResponse.json({
      data: {
        expiredRateBuckets: buckets.count,
        expiredResetTokens: resets.count,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
