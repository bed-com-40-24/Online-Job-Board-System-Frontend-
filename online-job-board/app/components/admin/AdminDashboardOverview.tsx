"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";

export default function AdminDashboardOverview({ employerCount }: { employerCount?: number }) {
  const { employers, adminActivity } = useStore();
  const pendingEmployers = employers.filter((employer) => employer.status === "Pending verification");
  const overview = [
    { label: "Registered employers", count: employerCount ?? employers.length, description: "All employer accounts", href: "/admin/employers" },
    { label: "Pending verification", count: pendingEmployers.length, description: "Requires review", href: "/admin/verification" },
  ];

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

      <div className="admin-dashboard-panels">
        <section aria-labelledby="employer-verification-title" className="admin-panel">
          <div className="admin-panel-heading">
            <div><h2 id="employer-verification-title">Employer verification</h2></div>
            <Link className="admin-panel-button" href="/admin/verification">Review</Link>
          </div>
          {pendingEmployers.length ? (
            <ul className="admin-pending-employers">
              {pendingEmployers.map((employer) => (
                <li key={employer.id}>
                  <div><strong>{employer.name}</strong><span>{employer.email}</span></div>
                  <span className="admin-dashboard-status status-pending">Pending verification</span>
                </li>
              ))}
            </ul>
          ) : <p className="admin-empty-state">There are no employers waiting for verification.</p>}
        </section>

        <section aria-labelledby="recent-activity-title" className="admin-panel admin-activity-panel">
          <div className="admin-panel-heading">
            <div><h2 id="recent-activity-title">Recent platform activity</h2></div>
            <Link className="admin-panel-button" href="/admin/activity">View activity</Link>
          </div>
          {adminActivity.length ? (
            <ul className="admin-recent-activity">
              {adminActivity.slice(0, 5).map((activity) => (
                <li key={activity.id}>
                  <span aria-hidden="true" className="admin-activity-dot" />
                  <div><strong>{activity.title}</strong><span>{activity.detail}</span></div>
                  <time dateTime={activity.createdAt}>{new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(activity.createdAt))}</time>
                </li>
              ))}
            </ul>
          ) : <p className="admin-empty-state">Admin decisions and reviews will appear here as they happen.</p>}
        </section>
      </div>
    </>
  );
}
