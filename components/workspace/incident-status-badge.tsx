import type { IncidentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const tone = {
  NEW: "danger",
  ACKNOWLEDGED: "warning",
  INVESTIGATING: "info",
  RESOLVED: "good",
  FALSE_POSITIVE: "neutral",
} as const;

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  return <Badge tone={tone[status]}>{status.replaceAll("_", " ").toLowerCase()}</Badge>;
}
