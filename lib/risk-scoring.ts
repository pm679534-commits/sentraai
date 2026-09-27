import type { Action, IncidentStatus, Prisma, Severity, Plan } from "@prisma/client";
import { historyStart } from "./plans";

type RiskIncident = {
  id: string;
  occurredAt: Date;
  action: Action;
  severity: Severity;
  matchCount: number;
  status: IncidentStatus;
};

// Action describes the containment outcome; severity describes potential impact.
// False positives contribute nothing. Callers provide only incidents within the
// organization's plan window, so hidden history never contributes to the score.
export function calculateRiskScore(events: RiskIncident[], now = new Date()) {
  const actionWeight: Record<Action, number> = { BLOCK: 8, MASK: 5, ALERT: 2 };
  const severityWeight: Record<Severity, number> = {
    CRITICAL: 1.7, HIGH: 1.3, MEDIUM: 1, LOW: 0.6,
  };
  const ordered = events.filter((event) => event.status !== "FALSE_POSITIVE")
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
  let score = 0;
  let previous = 0;
  for (const event of ordered) {
    const ageDays = Math.max(0, (now.getTime() - event.occurredAt.getTime()) / 86_400_000);
    // Incidents from the last 30 days count more than older visible history.
    const recency = ageDays <= 7 ? 1.8 : ageDays <= 30 ? 1.25 : 0.55;
    // A burst inside 48 hours raises risk faster than evenly spaced events.
    const clustered = previous && event.occurredAt.getTime() - previous <= 48 * 3_600_000 ? 1.3 : 1;
    score += actionWeight[event.action] * severityWeight[event.severity] * recency * clustered
      * (1 + 0.2 * (Math.min(event.matchCount, 3) - 1));
    previous = event.occurredAt.getTime();
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function recomputeEmployeeRisk(
  tx: Prisma.TransactionClient,
  organizationId: string,
  employeeId: string,
  plan: Plan,
  triggeringIncidentId?: string | null,
) {
  const now = new Date();
  const [employee, incidents] = await Promise.all([
    tx.employee.findFirst({
      where: { id: employeeId, organizationId },
      select: { riskScore: true },
    }),
    tx.incident.findMany({
      where: { employeeId, organizationId, occurredAt: { gte: historyStart(plan, now) } },
      select: { id: true, occurredAt: true, action: true, severity: true, matchCount: true, status: true },
      orderBy: { occurredAt: "desc" },
    }),
  ]);
  if (!employee) return;
  const next = calculateRiskScore(incidents, now);
  if (next === employee.riskScore) return;
  await tx.employee.update({ where: { id: employeeId }, data: { riskScore: next } });
  await tx.auditLog.create({
    data: {
      organizationId,
      action: "employee.risk_score_changed",
      targetType: "Employee",
      targetId: employeeId,
      metadata: {
        fromScore: employee.riskScore,
        toScore: next,
        incidentId: triggeringIncidentId === null
          ? null : triggeringIncidentId ?? incidents[0]?.id ?? null,
      },
    },
  });
}
