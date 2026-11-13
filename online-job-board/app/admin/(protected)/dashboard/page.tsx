import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import BrandMark from "@/app/components/brand-mark";
import HistoryNavigation from "@/app/components/HistoryNavigation";
import AdminLogoutButton from "@/app/components/admin-logout-button";
import AdminSidebar from "@/app/components/admin-sidebar";
import { getAdminEmployerCount } from "@/lib/admin-data";
import { getAdminSession } from "@/lib/admin-session";

const overview = [
  {
    label: "Pending verification",
    description: "Verification queue is not connected",
    href: "/admin/verification",
    icon: "✓",
  },
  {
    label: "Jobs awaiting review",
    description: "Moderation queue is not connected",
    href: "/admin/jobs",
    icon: "▤",
  },
  {
    label: "Published postings",
    description: "Publishing data is not connected",
    href: "/admin/jobs",
    icon: "◷",
  },
] as const;

function EmployerCountCard({ count }: { count?: number }) {
  return (
    <Link className="admin-overview-card" href="/admin/employers">
      <span className="admin-overview-icon" aria-hidden="true">♧</span>
      <span className="admin-overview-label">Registered employers</span>
      <strong aria-label={count === undefined ? "Loading employer count" : `${count} employers`}>
        {count ?? <span className="dashboard-count-placeholder" aria-hidden="true" />}
      </strong>
      <span className="admin-overview-description">All employer accounts</span>
    </Link>
  );
}

async function RegisteredEmployersCard() {
  const count = await getAdminEmployerCount();
  return <EmployerCountCard count={count} />;
}

export default async function AdminDashboardPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  return (
    <main className="admin-workspace">
      <AdminSidebar currentSection="dashboard" fullName={admin.fullName} />

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
            <h1>Platform overview</h1>
            <p>Verify employers, moderate submitted jobs and monitor platform activity.</p>
          </div>
        </div>

        <section className="admin-overview-grid" aria-label="Platform overview">
          <Suspense fallback={<EmployerCountCard />}>
            <RegisteredEmployersCard />
          </Suspense>
          {overview.map((item) => (
            <Link className="admin-overview-card" href={item.href} key={item.label}>
              <span className="admin-overview-icon" aria-hidden="true">{item.icon}</span>
              <span className="admin-overview-label">{item.label}</span>
              <strong>—</strong>
              <span className="admin-overview-description">{item.description}</span>
            </Link>
          ))}
        </section>

        <div className="admin-dashboard-panels">
          <section className="admin-panel" aria-labelledby="moderation-queue-title">
            <div className="admin-panel-heading">
              <div>
                <h2 id="moderation-queue-title">Jobs awaiting moderation</h2>
                <p>Review submitted job postings.</p>
              </div>
              <Link className="admin-panel-button" href="/admin/jobs">Open queue</Link>
            </div>
            <p className="admin-empty-state" role="status">
              Job moderation is not connected yet. Job posting data is not currently available to
              the administrator workspace.
            </p>
          </section>

          <section className="admin-panel" aria-labelledby="employer-verification-title">
            <div className="admin-panel-heading">
              <div>
                <h2 id="employer-verification-title">Employer verification</h2>
                <p>Review employer verification requests.</p>
              </div>
              <Link className="admin-panel-button" href="/admin/verification">Review</Link>
            </div>
            <p className="admin-empty-state" role="status">
              Employer verification is not connected yet. The employer database does not include
              verification status.
            </p>
          </section>

          <section className="admin-panel admin-activity-panel" aria-labelledby="recent-activity-title">
            <div className="admin-panel-heading">
              <div>
                <h2 id="recent-activity-title">Recent platform activity</h2>
                <p>Recent account, verification and job-posting events.</p>
              </div>
              <Link className="admin-panel-button" href="/admin/activity">View activity</Link>
            </div>
            <p className="admin-empty-state" role="status">
              Activity monitoring is not connected yet. The platform does not currently store an
              activity log.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
