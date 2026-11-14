import Link from "next/link";
import { redirect } from "next/navigation";
import AdminDashboardHeaderTools, { AdminDashboardMenuButton } from "@/app/components/admin/AdminDashboardHeaderTools";
import AdminSidebar from "@/app/components/admin/admin-sidebar";
import Badge from "@/app/components/shared/Badge";
import BrandMark from "@/app/components/shared/brand-mark";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
import { getEmployerVerificationStatus, seedEmployers } from "@/lib/data";
import { getAdminSession } from "@/lib/admin-session";

const checks = [
  { label: "Business name and contact details provided", passes: (employer: (typeof seedEmployers)[number]) => employer.name.trim().length >= 2 && employer.contact.trim().length >= 2 },
  { label: "Business email has a valid format", passes: (employer: (typeof seedEmployers)[number]) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employer.email) },
  { label: "Phone number has a valid format", passes: (employer: (typeof seedEmployers)[number]) => /^[+\d][\d\s()-]{6,}$/.test(employer.phone) },
  { label: "Business address, industry and registration number provided", passes: (employer: (typeof seedEmployers)[number]) => employer.address.trim().length >= 2 && employer.industry.trim().length >= 2 && /^[A-Z0-9-]{6,30}$/i.test(employer.regNo.trim()) },
];

export default async function EmployerVerificationPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

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
            <p>The system checks business profile details automatically.</p>
          </div>
        </div>
        <section aria-label="Automatic employer verification results" className="admin-panel">
          <p className="muted">Automatic screening checks that required details are present and formatted correctly. It does not query an external business registry.</p>
          <div className="admin-table-wrap" role="region" tabIndex={0}>
            <table className="admin-employer-table">
              <thead><tr><th scope="col">Employer</th><th scope="col">Automated checks</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {seedEmployers.map((employer) => {
                  const status = employer.status === "Rejected" ? "Rejected" : getEmployerVerificationStatus(employer);
                  return (
                    <tr key={employer.id}>
                      <td><strong>{employer.name}</strong><span className="admin-employer-email">{employer.email}</span></td>
                      <td>{checks.map((check) => <div key={check.label}>{check.passes(employer) ? "Passed" : "Needs details"}: {check.label}</div>)}</td>
                      <td><Badge status={status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
