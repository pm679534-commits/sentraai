export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { IncidentStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { historyStart } from "@/lib/plans";
import { incidentTransitions } from "@/lib/incident-triage";
import { recomputeEmployeeRisk } from "@/lib/risk-scoring";
import {
  ApiError, ids, jsonError, mutationGuard, parseBody, requireManager, requireUser,
} from "@/lib/api";

const changeSchema = z.object({
  status: z.nativeEnum(IncidentStatus).optional(),
  assignedToUserId: ids.nullable().optional(),
  resolutionNote: z.string().trim().min(1).max(2000).optional(),
}).strict();

const relations = {
  employee: { select: { id: true, name: true, email: true, department: true } },
  assignedToUser: { select: { id: true, name: true } },
} as const;

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    ids.parse(params.id);
    const user = await requireUser();
    const data = await prisma.incident.findFirst({
      where: {
        id: params.id,
        organizationId: user.organizationId!,
        occurredAt: { gte: historyStart(user.plan) },
      },
      include: relations,
    });
    if (!data) throw new ApiError(404, "NOT_FOUND", "Incident not found");
    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    ids.parse(params.id);
    mutationGuard(request);
    const user = await requireManager();
    const change = await parseBody(request, changeSchema);
    if (Object.keys(change).length === 0)
      throw new ApiError(400, "EMPTY_CHANGE", "No change was supplied");
    const data = await prisma.$transaction(async (tx) => {
      const current = await tx.incident.findFirst({
        where: {
          id: params.id,
          organizationId: user.organizationId!,
          occurredAt: { gte: historyStart(user.plan) },
        },
        select: { status: true, assignedToUserId: true, reviewedAt: true, employeeId: true },
      });
      if (!current) throw new ApiError(404, "NOT_FOUND", "Incident not found");
      const statusChanged = change.status !== undefined && change.status !== current.status;
      if (statusChanged && !incidentTransitions[current.status].includes(change.status!))
        throw new ApiError(409, "INVALID_TRANSITION", "This status transition is not allowed");
      const closing = statusChanged &&
        (change.status === "RESOLVED" || change.status === "FALSE_POSITIVE");
      if (closing && !change.resolutionNote)
        throw new ApiError(400, "RESOLUTION_NOTE_REQUIRED", "Add a resolution note to close the incident");
      if (change.resolutionNote && !closing)
        throw new ApiError(400, "INVALID_RESOLUTION_NOTE", "A resolution note requires a closing status");
      if (change.assignedToUserId) {
        const assignee = await tx.user.findFirst({
          where: {
            id: change.assignedToUserId,
            organizationId: user.organizationId!,
            role: { in: ["OWNER", "ADMIN", "MEMBER"] },
          },
          select: { id: true },
        });
        if (!assignee) throw new ApiError(400, "INVALID_ASSIGNEE", "Assignee must belong to this organization");
      }
      if (!statusChanged && change.assignedToUserId === undefined)
        throw new ApiError(400, "EMPTY_CHANGE", "No status or assignment change was supplied");
      const result = await tx.incident.updateMany({
        where: { id: params.id, organizationId: user.organizationId!, status: current.status },
        data: {
          ...(statusChanged ? { status: change.status } : {}),
          ...(change.assignedToUserId !== undefined ? { assignedToUserId: change.assignedToUserId } : {}),
          ...(closing ? { resolvedAt: new Date(), resolutionNote: change.resolutionNote } : {}),
          ...(statusChanged && !current.reviewedAt ? { reviewedAt: new Date() } : {}),
        },
      });
      if (!result.count)
        throw new ApiError(409, "STALE_INCIDENT", "Incident changed; refresh and try again");
      await tx.auditLog.create({
        data: {
          organizationId: user.organizationId!,
          actorId: user.id,
          action: statusChanged ? "incident.status_changed" : "incident.assignment_changed",
          targetType: "Incident",
          targetId: params.id,
          metadata: {
            fromStatus: current.status,
            toStatus: change.status ?? current.status,
            fromAssignedToUserId: current.assignedToUserId,
            toAssignedToUserId: change.assignedToUserId !== undefined
              ? change.assignedToUserId : current.assignedToUserId,
            ...(closing ? { resolutionNote: change.resolutionNote } : {}),
          },
        },
      });
      if (change.status === "FALSE_POSITIVE" && current.employeeId)
        await recomputeEmployeeRisk(tx, user.organizationId!, current.employeeId, user.plan, params.id);
      return tx.incident.findUniqueOrThrow({ where: { id: params.id }, include: relations });
    });
    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    ids.parse(params.id);
    mutationGuard(request);
    const user = await requireManager();
    await prisma.$transaction(async (tx) => {
      const current = await tx.incident.findFirst({
        where: { id: params.id, organizationId: user.organizationId! },
        select: { employeeId: true },
      });
      if (!current) throw new ApiError(404, "NOT_FOUND", "Incident not found");
      await tx.incident.delete({ where: { id: params.id } });
      if (current.employeeId)
        await recomputeEmployeeRisk(tx, user.organizationId!, current.employeeId, user.plan, null);
      await tx.auditLog.create({
        data: {
          organizationId: user.organizationId!, actorId: user.id,
          action: "incident.deleted", targetType: "Incident", targetId: params.id,
        },
      });
    });
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    return jsonError(error);
  }
}
