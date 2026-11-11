import Link from "next/link";
import { redirect } from "next/navigation";
import AdminDashboardHeaderTools, { AdminDashboardMenuButton } from "@/app/components/admin/AdminDashboardHeaderTools";
import AdminEmployersManagement from "@/app/components/admin/AdminEmployersManagement";
import AdminSidebar from "@/app/components/admin/admin-sidebar";
import BrandMark from "@/app/components/shared/brand-mark";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
import { getAdminSession } from "@/lib/admin-session";

export default async function AdminEmployersPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  return (
    <main className="admin-workspace">
      <AdminSidebar currentSection="employers" fullName={admin.fullName} />
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
            <h1>Employer management</h1>
            <p>View registered employers and their statuses.</p>
          </div>
        </div>
        <AdminEmployersManagement />
      </section>
    </main>
  );
}
