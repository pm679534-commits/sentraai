export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { Action, IncidentStatus, Severity } from "@prisma/client";
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

const schema = z.object({
  employeeId: z.string().cuid().nullable().optional(),
  tool: z.string().trim().min(2).max(60),
  category: z.string().trim().min(2).max(40),
  action: z.nativeEnum(Action),
  severity: z.nativeEnum(Severity),
  matchCount: z.number().int().min(1).max(100).default(1),
});
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const p = request.nextUrl.searchParams;
    const page = Math.max(1, Math.min(1000, Number(p.get("page")) || 1));
    const q = p.get("q")?.slice(0, 80);
    const action = p.get("action");
    const status = p.get("status");
    const where = {
      organizationId: user.organizationId!,
      ...(action && Object.values(Action).includes(action as Action)
        ? { action: action as Action }
        : {}),
      ...(status &&
      Object.values(IncidentStatus).includes(status as IncidentStatus)
        ? { status: status as IncidentStatus }
        : {}),
      ...(q
        ? {
            OR: [
              { tool: { contains: q, mode: "insensitive" as const } },
              { category: { contains: q, mode: "insensitive" as const } },
              {
                employee: {
                  name: { contains: q, mode: "insensitive" as const },
                },
              },
            ],
          }
        : {}),
    };
    const [data, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        include: {
          employee: {
            select: { id: true, name: true, email: true, department: true },
          },
        },
        orderBy: { occurredAt: "desc" },
        skip: (page - 1) * 25,
        take: 25,
      }),
      prisma.incident.count({ where }),
    ]);
    return NextResponse.json({
      data,
      pagination: { page, total, pages: Math.ceil(total / 25) },
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
    if (
      data.employeeId &&
      !(await prisma.employee.findFirst({
        where: { id: data.employeeId, organizationId: user.organizationId! },
        select: { id: true },
      }))
    )
      throw new ApiError(
        400,
        "INVALID_EMPLOYEE",
        "Employee is outside this organization",
      );
    const incident = await prisma.incident.create({
      data: { ...data, organizationId: user.organizationId!, source: "manual" },
    });
    return NextResponse.json({ data: incident }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
