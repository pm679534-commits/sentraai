import type { Plan } from "@prisma/client";

// Enterprise retention is a default until per-tenant retention is configured.
export const planFeatures: Record<Plan, {
  incidentHistoryDays: number;
  departmentRiskAnalytics: boolean;
}> = {
  STARTER: { incidentHistoryDays: 30, departmentRiskAnalytics: false },
  BUSINESS: { incidentHistoryDays: 90, departmentRiskAnalytics: true },
  ENTERPRISE: { incidentHistoryDays: 365, departmentRiskAnalytics: true },
};

export function historyStart(plan: Plan, now = new Date()) {
  return new Date(now.getTime() - planFeatures[plan].incidentHistoryDays * 86_400_000);
}
