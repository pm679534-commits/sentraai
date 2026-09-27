import { redirect } from "next/navigation";
import { getSession, isInternalAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  if (!isInternalAdmin(session.user)) redirect("/dashboard");
  return (
    <AdminShell userName={session.user.name ?? "Administrator"}>
      {children}
    </AdminShell>
  );
}
