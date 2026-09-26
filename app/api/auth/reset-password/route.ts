export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ApiError, jsonError, mutationGuard, parseBody } from "@/lib/api";
import { clientIp, rateLimit, sha256 } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    mutationGuard(request);
    if (!(await rateLimit(`reset-complete:${clientIp(request)}`, 10, 3600)))
      throw new ApiError(429, "RATE_LIMITED", "Try again later");
    const { token, password } = await parseBody(
      request,
      z.object({
        token: z.string().min(20),
        password: z.string().min(12).max(128),
      }),
    );
    const row = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: sha256(token) },
    });
    if (!row || row.expiresAt < new Date())
      throw new ApiError(
        400,
        "INVALID_TOKEN",
        "This reset link is invalid or expired",
      );
    await prisma.$transaction([
      prisma.user.update({
        where: { id: row.userId },
        data: { passwordHash: await hash(password, 12) },
      }),
      prisma.passwordResetToken.deleteMany({ where: { userId: row.userId } }),
    ]);
    return NextResponse.json({ data: { message: "Password updated" } });
  } catch (error) {
    return jsonError(error);
  }
}
