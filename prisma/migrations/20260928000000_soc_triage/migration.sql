ALTER TYPE "IncidentStatus" RENAME TO "IncidentStatus_old";
CREATE TYPE "IncidentStatus" AS ENUM ('NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE');
ALTER TABLE "Incident" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Incident" ALTER COLUMN "status" TYPE "IncidentStatus"
  USING (CASE "status"::text
    WHEN 'OPEN' THEN 'NEW'
    WHEN 'REVIEWED' THEN 'ACKNOWLEDGED'
    ELSE "status"::text
  END)::"IncidentStatus";
ALTER TABLE "Incident" ALTER COLUMN "status" SET DEFAULT 'NEW';
DROP TYPE "IncidentStatus_old";

ALTER TABLE "Incident" ADD COLUMN "assignedToUserId" TEXT;
ALTER TABLE "Incident" ADD COLUMN "resolvedAt" TIMESTAMP(3);
ALTER TABLE "Incident" ADD COLUMN "resolutionNote" TEXT;
UPDATE "Incident" SET "resolvedAt" = COALESCE("reviewedAt", "occurredAt") WHERE "status" = 'RESOLVED';
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_assignedToUserId_fkey"
  FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Incident_organizationId_employeeId_occurredAt_idx" ON "Incident"("organizationId", "employeeId", "occurredAt");
CREATE INDEX "AuditLog_organizationId_targetType_targetId_createdAt_idx" ON "AuditLog"("organizationId", "targetType", "targetId", "createdAt");
