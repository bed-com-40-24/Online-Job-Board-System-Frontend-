import Link from "next/link";
import { redirect } from "next/navigation";
import AdminDashboardHeaderTools, { AdminDashboardMenuButton } from "@/app/components/admin/AdminDashboardHeaderTools";
import AdminSidebar from "@/app/components/admin/admin-sidebar";
import Badge from "@/app/components/shared/Badge";
import BrandMark from "@/app/components/shared/brand-mark";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
import { getAdminSession } from "@/lib/admin-session";
import { getEmployerVerificationRecords } from "@/lib/employer-verification-records";

export default async function EmployerVerificationPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  const employers = await getEmployerVerificationRecords();

  return (
    <main className="admin-workspace">
      <AdminSidebar currentSection="verification" fullName={admin.fullName} />
      <header className="admin-topbar">
        <div className="admin-topbar-brand-tools">
          <Link className="admin-topbar-brand" href="/admin/dashboard"><BrandMark /><span>OnlineJobBoard</span></Link>
          <AdminDashboardMenuButton />
        </div>
        <AdminDashboardHeaderTools fullName={admin.fullName} />
      </header>
      <section className="admin-workspace-content">
        <div className="admin-page-heading">
          <HistoryNavigation fallbackHref="/admin/dashboard" />
          <div>
            <p className="admin-eyebrow">ADMINISTRATOR WORKSPACE</p>
            <h1>Employer verification</h1>
            <p>Results are taken from the configured trusted verification provider.</p>
          </div>
        </div>
        <section aria-label="Automatic employer verification results" className="admin-panel">
          <p className="muted">Profile completeness and uploaded documents are not treated as proof of business legitimacy. When no trusted provider result is available, the employer remains Pending.</p>
          <div className="admin-table-wrap" role="region" tabIndex={0}>
            <table className="admin-employer-table">
              <thead><tr><th scope="col">Employer</th><th scope="col">Provider result</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {employers.map((employer) => {
                  return (
                    <tr key={employer.id}>
                      <td><strong>{employer.companyName}</strong><span className="admin-employer-email">{employer.email}</span></td>
                      <td>{employer.reason ?? (employer.status === "Pending" ? "No conclusive provider result." : "Provider returned a conclusive result.")}{employer.checkedAt && <span className="admin-employer-email">Checked {new Date(employer.checkedAt).toLocaleString()}</span>}</td>
                      <td><Badge status={employer.status} /></td>
                    </tr>
                  );
                })}
                {employers.length === 0 && <tr><td colSpan={3}>No employer verification records yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
