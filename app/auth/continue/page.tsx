import { redirect } from "next/navigation";
import { getSession, isInternalAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  redirect(isInternalAdmin(session.user) && process.env.ADMIN_EMAIL?.trim()
    ? "/admin"
    : "/dashboard");
}
