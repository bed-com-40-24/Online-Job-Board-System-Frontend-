import Link from "next/link";
import { redirect } from "next/navigation";
import AdminDashboardHeaderTools, { AdminDashboardMenuButton } from "@/app/components/admin/AdminDashboardHeaderTools";
import AdminJobDetails from "@/app/components/admin/AdminJobDetails";
import AdminSidebar from "@/app/components/admin/admin-sidebar";
import BrandMark from "@/app/components/shared/brand-mark";
import { getAdminSession } from "@/lib/admin-session";

export default async function AdminJobDetailsPage({
  params,
}: PageProps<"/admin/jobs/[id]">) {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  const { id } = await params;

  return (
    <main className="admin-workspace">
      <AdminSidebar currentSection="moderation" fullName={admin.fullName} />
      <header className="admin-topbar">
        <div className="admin-topbar-brand-tools">
          <Link className="admin-topbar-brand" href="/admin/dashboard">
            <BrandMark />
            <span>OnlineJobBoard</span>
          </Link>
          <AdminDashboardMenuButton />
        </div>
        <AdminDashboardHeaderTools fullName={admin.fullName} />
      </header>
      <section className="admin-workspace-content admin-job-details-page">
        <AdminJobDetails jobId={id} />
      </section>
    </main>
  );
}
