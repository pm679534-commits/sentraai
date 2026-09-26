import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { OnboardingForm } from "@/components/workspace/onboarding-form";
export const metadata = { title: "Set up your workspace" };
export default async function Page() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  if (session.user.organizationId) redirect("/dashboard");
  return <OnboardingForm />;
}
