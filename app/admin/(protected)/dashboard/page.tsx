import Link from "next/link";
import { redirect } from "next/navigation";
import BrandMark from "@/app/components/shared/brand-mark";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
import AdminDashboardHeaderTools, { AdminDashboardMenuButton } from "@/app/components/admin/AdminDashboardHeaderTools";
import AdminDashboardOverview from "@/app/components/admin/AdminDashboardOverview";
import AdminSidebar from "@/app/components/admin/admin-sidebar";
import { getAdminEmployerCount } from "@/lib/admin-data";
import { getAdminSession } from "@/lib/admin-session";

export default async function AdminDashboardPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  const employerCount = await getAdminEmployerCount();

  return (
    <main className="admin-workspace">
      <AdminSidebar currentSection="dashboard" fullName={admin.fullName} />

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

      <section className="admin-workspace-content">
        <div className="admin-page-heading">
          <HistoryNavigation fallbackHref="/admin/dashboard" />
          <div>
            <p className="admin-eyebrow">ADMINISTRATOR WORKSPACE</p>
            <h1>Platform overview</h1>
            <p>Verify employers, moderate submitted jobs and monitor platform activity.</p>
          </div>
        </div>

        <AdminDashboardOverview employerCount={employerCount} />
      </section>
    </main>
  );
}
