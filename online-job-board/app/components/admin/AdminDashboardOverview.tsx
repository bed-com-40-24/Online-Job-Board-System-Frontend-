"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";

export default function AdminDashboardOverview({ employerCount }: { employerCount?: number }) {
  const { employers, jobs, myApplicants, adminActivity } = useStore();
  const inReviewJobs = jobs.filter((job) => job.status === "In review");
  const pendingEmployers = employers.filter((employer) => employer.status === "Pending");
  const publishedJobs = jobs.filter((job) => job.status === "Published");
  const overview = [
    { label: "Registered employers", count: employerCount ?? employers.length, description: "All employer accounts", href: "/admin/employers" },
    { label: "Pending verification", count: pendingEmployers.length, description: "Requires review", href: "/admin/verification" },
    { label: "Jobs awaiting review", count: inReviewJobs.length, description: "Moderation queue", href: "/admin/jobs" },
    { label: "Published postings", count: publishedJobs.length, description: "Approved vacancies", href: "/admin/jobs" },
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
        <section aria-labelledby="moderation-queue-title" className="admin-panel">
          <div className="admin-panel-heading">
            <div><h2 id="moderation-queue-title">Jobs awaiting moderation</h2></div>
            <Link className="admin-panel-button" href="/admin/jobs">Open queue</Link>
          </div>
          {inReviewJobs.length ? (
            <div aria-label="Jobs awaiting moderation" className="admin-dashboard-table-wrap" role="region" tabIndex={0}>
              <table className="admin-dashboard-table">
                <thead><tr><th>Vacancy</th><th>Employer</th><th>Type / location</th><th>Applicants</th><th>Status</th></tr></thead>
                <tbody>{inReviewJobs.map((job) => {
                  const owner = employers.find((employer) => employer.id === job.owner);
                  const applicantCount = myApplicants.filter((applicant) => applicant.jobId === job.id).length;
                  return (
                    <tr key={job.id}>
                      <td><strong>{job.title}</strong><span>{job.id}{job.dept ? ` · ${job.dept}` : ""}</span></td>
                      <td>{owner?.name ?? "Unknown employer"}</td>
                      <td>{job.type ?? "Full-time"}<span>{job.loc}</span></td>
                      <td>{applicantCount}</td>
                      <td><span className="admin-dashboard-status status-review">In review</span></td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          ) : <p className="admin-empty-state">There are no job postings awaiting moderation.</p>}
        </section>

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
