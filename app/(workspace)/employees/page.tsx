import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PageHeading } from "@/components/workspace/page-heading";
import { EmployeeTable } from "@/components/workspace/employee-table";
export const metadata = { title: "Employees" };
export default async function Page() {
  const session = await getSession();
  const employees = await prisma.employee.findMany({
    where: { organizationId: session!.user.organizationId! },
    orderBy: { riskScore: "desc" },
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
          createdAt: e.createdAt.toISOString(),
        }))}
        canManage={session!.user.role !== "MEMBER"}
      />
    </>
  );
}
