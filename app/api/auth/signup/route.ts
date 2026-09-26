export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ApiError, jsonError, mutationGuard, parseBody } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/security";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z
    .string()
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  password: z.string().min(12).max(128),
});
export async function POST(request: NextRequest) {
  try {
    mutationGuard(request);
    if (!(await rateLimit(`signup:${clientIp(request)}`, 5, 3600)))
      throw new ApiError(429, "RATE_LIMITED", "Try again later");
    const data = await parseBody(request, schema);
    if (
      await prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      })
    )
      throw new ApiError(
        409,
        "ACCOUNT_EXISTS",
        "An account already uses this email",
      );
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: await hash(data.password, 12),
        role: "OWNER",
      },
      select: { id: true },
    });
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
