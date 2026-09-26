export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  ApiError,
  jsonError,
  mutationGuard,
  parseBody,
  requireUser,
} from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  industry: z.string().trim().min(2).max(80),
  teamSize: z.enum(["1-25", "26-100", "101-500", "501-2000", "2000+"]),
});
export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({
      data: await prisma.organization.findUnique({
        where: { id: user.organizationId! },
        select: {
          id: true,
          name: true,
          industry: true,
          teamSize: true,
          status: true,
          plan: true,
          createdAt: true,
        },
      }),
    });
  } catch (error) {
    return jsonError(error);
  }
}
export async function POST(request: NextRequest) {
  try {
    mutationGuard(request);
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session?.user?.id || session.user.role !== "OWNER")
      throw new ApiError(403, "FORBIDDEN", "Owner access required");
    if (session.user.organizationId)
      throw new ApiError(
        409,
        "ALREADY_ONBOARDED",
        "An organization is already linked",
      );
    const data = await parseBody(request, schema);
    const slug = `${
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 42) || "organization"
    }-${Math.random().toString(36).slice(2, 8)}`;
    const org = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { ...data, slug },
      });
      await tx.user.update({
        where: { id: session.user.id },
        data: { organizationId: organization.id },
      });
      await tx.policyRule.createMany({
        data: [
          "CARD",
          "AZ_FIN",
          "EMAIL",
          "PHONE",
          "SECRET",
          "IBAN",
          "FINANCIAL",
          "CONFIDENTIAL",
        ].map((category) => ({
          organizationId: organization.id,
          category,
          action:
            category === "SECRET" || category === "CARD"
              ? ("BLOCK" as const)
              : ("MASK" as const),
        })),
      });
      return organization;
    });
    return NextResponse.json({ data: org }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
export async function PATCH(request: NextRequest) {
  try {
    mutationGuard(request);
    const user = await requireUser();
    if (user.role !== "OWNER" && user.role !== "ADMIN")
      throw new ApiError(403, "FORBIDDEN", "Manager access required");
    const data = await parseBody(request, schema.partial());
    const org = await prisma.organization.update({
      where: { id: user.organizationId! },
      data,
    });
    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        actorId: user.id,
        action: "organization.updated",
        targetType: "Organization",
        targetId: org.id,
        metadata: data,
      },
    });
    return NextResponse.json({ data: org });
  } catch (error) {
    return jsonError(error);
  }
}
