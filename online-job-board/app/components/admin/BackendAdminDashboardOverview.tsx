import Link from "next/link";
import type { BackendUser, EmployerRequest } from "@/app/components/admin/EmployerRequestsManagement";

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  href: string;
};

function formatActivityDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function BackendAdminDashboardOverview({
  users,
  requests,
}: {
  users: BackendUser[];
  requests: EmployerRequest[];
}) {
  const employers = users.filter((user) => user.role.toUpperCase() === "EMPLOYER");
  const pendingRequestCount = requests.filter((request) => request.status.toUpperCase() === "PENDING").length;
  const approvedRequestCount = requests.filter((request) => request.status.toUpperCase() === "APPROVED").length;
  const overview = [
    {
      label: "Employer accounts",
      count: employers.length,
      description: "Registered employers",
      href: "/admin/employers#platform-accounts",
    },
    {
      label: "Approved requests",
      count: approvedRequestCount,
      description: "Employer access approved",
      href: "/admin/employers#employer-requests",
    },
    {
      label: "Pending employer requests",
      count: pendingRequestCount,
      description: "Awaiting an administrator decision",
      href: "/admin/employers#employer-requests",
    },
  ];
  const recentActivity: ActivityItem[] = [
    ...employers.map((user) => ({
      id: `account-${user.id}`,
      title: "Employer account registered",
      detail: user.email,
      createdAt: user.createdAt,
      href: "/admin/employers#platform-accounts",
    })),
    ...requests.map((request) => ({
      id: `request-${request.id}`,
      title: "Employer approval request",
      detail: `${request.companyName} · ${request.status}`,
      createdAt: request.createdAt,
      href: "/admin/employers#employer-requests",
    })),
  ]
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, 5);

  return (
    <>
      <section aria-label="Platform overview" className="admin-overview-grid">
        {overview.map((item) => (
          <Link className="admin-overview-card" href={item.href} key={item.label}>
            <span className="admin-overview-label">{item.label}</span>
            <strong>{item.count}</strong>
            <span className="admin-overview-description">{item.description}</span>
          </Link>
        ))}
      </section>

      <div className="admin-dashboard-panels backend-admin-dashboard-panels">
        <section aria-labelledby="backend-recent-activity-title" className="admin-panel admin-activity-panel">
          <div className="admin-panel-heading">
            <div>
              <h2 id="backend-recent-activity-title">Recent platform activity</h2>
              <p>Latest employer registrations and approval requests.</p>
            </div>
            <Link className="admin-panel-button" href="/admin/employers">Open administration</Link>
          </div>
          {recentActivity.length ? (
            <ul className="admin-recent-activity">
              {recentActivity.map((activity) => (
                <li key={activity.id}>
                  <span aria-hidden="true" className="admin-activity-dot" />
                  <div>
                    <Link href={activity.href}><strong>{activity.title}</strong></Link>
                    <span>{activity.detail}</span>
                  </div>
                  <time dateTime={activity.createdAt}>{formatActivityDate(activity.createdAt)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-empty-state">No account registrations or employer requests are available yet.</p>
          )}
        </section>

        <aside className="admin-panel backend-admin-capabilities">
          <h2>Available admin sections</h2>
          <p>The connected backend supports employer account and access-request management.</p>
          <Link className="admin-panel-button" href="/admin/employers">Manage employers and requests</Link>
        </aside>
      </div>
    </>
  );
}
