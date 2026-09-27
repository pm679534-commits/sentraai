CREATE INDEX "Employee_organizationId_riskScore_idx" ON "Employee"("organizationId", "riskScore");
CREATE INDEX "Incident_organizationId_action_occurredAt_idx" ON "Incident"("organizationId", "action", "occurredAt");
CREATE INDEX "Incident_organizationId_status_occurredAt_idx" ON "Incident"("organizationId", "status", "occurredAt");
CREATE INDEX "Incident_occurredAt_idx" ON "Incident"("occurredAt");
CREATE INDEX "Incident_action_occurredAt_idx" ON "Incident"("action", "occurredAt");
