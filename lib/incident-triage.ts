import type { IncidentStatus } from "@prisma/client";

export const incidentTransitions: Record<IncidentStatus, IncidentStatus[]> = {
  NEW: ["ACKNOWLEDGED", "INVESTIGATING", "FALSE_POSITIVE"],
  ACKNOWLEDGED: ["INVESTIGATING", "RESOLVED", "FALSE_POSITIVE"],
  INVESTIGATING: ["RESOLVED", "FALSE_POSITIVE"],
  RESOLVED: [],
  FALSE_POSITIVE: [],
};

export const openIncidentStatuses: IncidentStatus[] = [
  "NEW", "ACKNOWLEDGED", "INVESTIGATING",
];
