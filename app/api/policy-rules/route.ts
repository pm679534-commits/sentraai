export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { Action } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  ApiError,
  jsonError,
  mutationGuard,
  parseBody,
  requireManager,
  requireUser,
} from "@/lib/api";
import { CATEGORIES } from "@/lib/detection-engine";
const schema = z.object({
  category: z.enum(CATEGORIES),
  enabled: z.boolean().default(true),
  action: z.nativeEnum(Action),
});
export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({
      data: await prisma.policyRule.findMany({
        where: { organizationId: user.organizationId! },
        orderBy: { category: "asc" },
      }),
    });
  } catch (error) {
    return jsonError(error);
  }
}
export async function POST(request: NextRequest) {
  try {
    mutationGuard(request);
    const user = await requireManager();
    const data = await parseBody(request, schema);
    const exists = await prisma.policyRule.findUnique({
      where: {
        organizationId_category: {
          organizationId: user.organizationId!,
          category: data.category,
        },
      },
    });
    if (exists)
      throw new ApiError(
        409,
        "RULE_EXISTS",
        "A rule for this category already exists",
      );
    const rule = await prisma.policyRule.create({
      data: { ...data, organizationId: user.organizationId! },
    });
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId!,
        actorId: user.id,
        action: "policy.created",
        targetType: "PolicyRule",
        targetId: rule.id,
        metadata: {
          category: rule.category,
          action: rule.action,
          enabled: rule.enabled,
        },
      },
    });
    return NextResponse.json({ data: rule }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
