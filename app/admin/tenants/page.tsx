import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/workspace/page-heading";
import { TenantTable } from "@/components/admin/tenant-table";
export const metadata = { title: "Tenant management" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const rows = await prisma.organization.findMany({
    include: {
      _count: {
        select: { users: true, employees: true, incidents: true, scans: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <PageHeading
        eyebrow="Customer accounts"
        title="Tenant management"
        description="Manage plans and access across all customer organizations."
      />
      <TenantTable
        initial={rows.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }))}
      />
    </>
  );
}
