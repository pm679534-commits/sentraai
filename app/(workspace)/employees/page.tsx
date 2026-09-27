import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PageHeading } from "@/components/workspace/page-heading";
import { EmployeeTable } from "@/components/workspace/employee-table";
import { planFeatures } from "@/lib/plans";
export const metadata = { title: "Employees" };
export default async function Page() {
  const session = await getSession();
  const organization = await prisma.organization.findUniqueOrThrow({
    where: { id: session!.user.organizationId! }, select: { plan: true },
  });
  const showRisk = planFeatures[organization.plan].departmentRiskAnalytics;
  const employees = await prisma.employee.findMany({
    where: { organizationId: session!.user.organizationId! },
    orderBy: showRisk ? { riskScore: "desc" } : { name: "asc" },
  });
  return (
    <>
      <PageHeading
        eyebrow="People & departments"
        title="Monitored employees"
        description="Understand AI activity and exposure patterns across every team."
      />
      <EmployeeTable
        initial={employees.map((e) => ({
          ...e,
          riskScore: showRisk ? e.riskScore : 0,
          createdAt: e.createdAt.toISOString(),
        }))}
        canManage={session!.user.role !== "MEMBER"}
        showRisk={showRisk}
      />
    </>
  );
}
