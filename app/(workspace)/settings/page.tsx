import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PageHeading } from "@/components/workspace/page-heading";
import { SettingsPanel } from "@/components/workspace/settings-panel";
export const metadata = { title: "Settings" };
export default async function Page() {
  const session = await getSession();
  const org = await prisma.organization.findUniqueOrThrow({
    where: { id: session!.user.organizationId! },
    select: {
      id: true,
      name: true,
      industry: true,
      teamSize: true,
      plan: true,
      status: true,
    },
  });
  const keys =
    session!.user.role !== "MEMBER"
      ? await prisma.apiKey.findMany({
          where: { organizationId: org.id },
          select: {
            id: true,
            name: true,
            prefix: true,
            createdAt: true,
            lastUsedAt: true,
            revokedAt: true,
          },
          orderBy: { createdAt: "desc" },
        })
      : [];
  return (
    <>
      <PageHeading
        eyebrow="Workspace"
        title="Settings"
        description="Manage your organization profile, subscription, and gateway credentials."
      />
      <SettingsPanel
        org={org}
        initialKeys={keys.map((k) => ({
          ...k,
          createdAt: k.createdAt.toISOString(),
          lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
          revokedAt: k.revokedAt?.toISOString() ?? null,
        }))}
        canManage={session!.user.role !== "MEMBER"}
      />
    </>
  );
}
