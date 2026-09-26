export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ApiError, jsonError, mutationGuard, parseBody } from "@/lib/api";
import { clientIp, rateLimit, sha256 } from "@/lib/security";

const response = {
  data: {
    message:
      "If that account exists, password reset instructions have been sent.",
  },
};
export async function POST(request: NextRequest) {
  try {
    mutationGuard(request);
    if (!(await rateLimit(`reset:${clientIp(request)}`, 5, 3600)))
      throw new ApiError(429, "RATE_LIMITED", "Try again later");
    const { email } = await parseBody(
      request,
      z.object({
        email: z
          .string()
          .email()
          .max(254)
          .transform((v) => v.toLowerCase()),
      }),
    );
    if (
      !process.env.RESEND_API_KEY ||
      !process.env.RESEND_FROM_EMAIL ||
      !process.env.NEXTAUTH_URL
    )
      throw new ApiError(
        503,
        "EMAIL_UNAVAILABLE",
        "Password reset email is not configured",
      );
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) return NextResponse.json(response);
    const token = randomBytes(32).toString("base64url");
    const url = `${process.env.NEXTAUTH_URL}/reset-password?token=${encodeURIComponent(token)}`;
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + 30 * 60_000),
      },
    });
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [email],
        subject: "Reset your SentraAI password",
        html: `<p>Use this link to reset your password. It expires in 30 minutes.</p><p><a href="${url}">Reset password</a></p>`,
      }),
    });
    if (!result.ok)
      throw new ApiError(
        503,
        "EMAIL_UNAVAILABLE",
        "Password reset email could not be sent",
      );
    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error);
  }
}
