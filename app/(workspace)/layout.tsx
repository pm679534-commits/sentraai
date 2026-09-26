import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WorkspaceShell } from "@/components/workspace/shell";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role === "INTERNAL_ADMIN") redirect("/admin");
  if (!session.user.organizationId) redirect("/onboarding");
  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { name: true, status: true },
  });
  if (!org || org.status === "SUSPENDED") redirect("/login");
  return (
    <WorkspaceShell
      orgName={org.name}
      userName={session.user.name ?? "Account"}
      role={session.user.role}
    >
      {children}
    </WorkspaceShell>
  );
}
