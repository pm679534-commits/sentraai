import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TenantPreview } from "@/components/admin/tenant-preview";
export const metadata = { title: "Read-only tenant view" };
export default function Page({ params }: { params: { id: string } }) {
  return (
    <>
      <Link
        href="/admin/tenants"
        className="mb-7 inline-flex items-center gap-2 text-sm text-muted hover:text-white"
      >
        <ArrowLeft size={16} /> Back to tenants
      </Link>
      <TenantPreview id={params.id} />
    </>
  );
}
