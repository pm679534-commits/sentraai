import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PageHeading } from "@/components/workspace/page-heading";
import { PolicyEditor } from "@/components/workspace/policy-editor";
export const metadata = { title: "Policy rules" };
export default async function Page() {
  const session = await getSession();
  const rows = await prisma.policyRule.findMany({
    where: { organizationId: session!.user.organizationId! },
    orderBy: { category: "asc" },
  });
  return (
    <>
      <PageHeading
        eyebrow="Controls"
        title="Policy rules"
        description="Decide how sensitive data is handled before a prompt reaches an AI tool."
      />
      <PolicyEditor
        initial={rows.map((r) => ({
          ...r,
          updatedAt: r.updatedAt.toISOString(),
        }))}
        canManage={session!.user.role !== "MEMBER"}
      />
    </>
  );
}
