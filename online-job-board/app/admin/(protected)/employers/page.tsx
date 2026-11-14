import Link from "next/link";
import { redirect } from "next/navigation";
import AdminLogoutButton from "@/app/components/admin-logout-button";
import AdminSidebar from "@/app/components/admin-sidebar";
import BrandMark from "@/app/components/brand-mark";
import HistoryNavigation from "@/app/components/HistoryNavigation";
import { getRecentAdminEmployers } from "@/lib/admin-data";
import { getAdminSession } from "@/lib/admin-session";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

export default async function AdminEmployersPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  const employers = await getRecentAdminEmployers(100);

  return (
    <main className="admin-workspace">
      <AdminSidebar currentSection="employers" fullName={admin.fullName} />
      <header className="admin-topbar">
        <Link className="admin-topbar-brand" href="/admin/dashboard">
          <BrandMark />
          <span>OnlineJobBoard</span>
        </Link>
        <HistoryNavigation fallbackHref="/admin/dashboard" />
        <div className="admin-topbar-user">
          <span>{admin.email}</span>
          <AdminLogoutButton />
        </div>
      </header>

      <section className="admin-workspace-content">
        <div className="admin-page-heading">
          <div>
            <p className="admin-eyebrow">ADMINISTRATOR WORKSPACE</p>
            <h1>Employer management</h1>
            <p>Registered employer accounts from the application database.</p>
          </div>
          <Link className="admin-back-link" href="/admin/dashboard">Back to overview</Link>
        </div>

        <section className="admin-panel" aria-labelledby="employer-directory-title">
          <div className="admin-panel-heading">
            <div>
              <h2 id="employer-directory-title">Employer directory</h2>
              <p>Showing the {employers.length} most recently registered account(s).</p>
            </div>
          </div>
          {employers.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-employer-table">
                <thead>
                  <tr>
                    <th scope="col">Company</th>
                    <th scope="col">Email</th>
                    <th scope="col">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {employers.map((employer) => (
                    <tr key={employer.id}>
                      <td>{employer.companyName}</td>
                      <td>{employer.email}</td>
                      <td>{formatDate(employer.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="admin-empty-state">No employer accounts have been registered yet.</p>
          )}
          <p className="admin-empty-state">
            Employer verification decisions are not stored in the current database schema.
          </p>
        </section>
      </section>
    </main>
  );
}
