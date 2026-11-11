import Link from "next/link";
import { redirect } from "next/navigation";
import AdminDashboardHeaderTools, { AdminDashboardMenuButton } from "@/app/components/admin/AdminDashboardHeaderTools";
import AdminJobModeration from "@/app/components/admin/AdminJobModeration";
import AdminSidebar from "@/app/components/admin/admin-sidebar";
import BrandMark from "@/app/components/shared/brand-mark";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
import { getAdminSession } from "@/lib/admin-session";

export default async function AdminJobsPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

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

      <section className="admin-workspace-content admin-job-moderation-content">
        <div className="admin-page-heading">
          <HistoryNavigation fallbackHref="/admin/dashboard" />
          <div>
            <p className="admin-eyebrow">ADMINISTRATOR WORKSPACE</p>
            <h1>Job moderation</h1>
            <p>Review submitted vacancies.</p>
          </div>
        </div>
        <AdminJobModeration />
      </section>
    </main>
  );
}
