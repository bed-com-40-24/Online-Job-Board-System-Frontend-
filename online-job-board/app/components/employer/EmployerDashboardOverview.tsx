"use client";

import Link from "next/link";
import { BriefcaseBusiness, Building2, Plus, UsersRound } from "lucide-react";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
import { EMP_ID } from "@/lib/data";
import { useStore } from "@/lib/store";

const quickActions = [
  { icon: Plus, title: "Create vacancy", description: "Start a job posting", href: "/employer/vacancies/new" },
  { icon: UsersRound, title: "Review applicants", description: "Manage candidates", href: "/employer/applications" },
  { icon: BriefcaseBusiness, title: "Manage vacancies", description: "Edit or close jobs", href: "/employer/vacancies" },
  { icon: Building2, title: "Company profile", description: "Update details", href: "/employer/profile" },
];

export default function EmployerDashboardOverview({ companyName }: { companyName: string }) {
  const { jobs, myApplicants } = useStore();
  const vacancies = jobs.filter((job) => job.owner === EMP_ID);
  const metrics = [
    { label: "My vacancies", value: vacancies.length, detail: "Owned by your account" },
    { label: "Applicants", value: myApplicants.length, detail: "Across your vacancies" },
    { label: "In review", value: vacancies.filter((job) => job.status === "In review").length, detail: "Awaiting moderation" },
    { label: "Published", value: vacancies.filter((job) => job.status === "Published").length, detail: "Currently visible" },
  ];

  return (
    <>
      <div className="employer-dashboard-intro">
        <div className="employer-page-heading">
          <HistoryNavigation fallbackHref="/employer/dashboard" />
          <div>
            <p className="employer-dashboard-kicker">EMPLOYER WORKSPACE</p>
            <div className="employer-dashboard-welcome">
              <div>
                <h1>Welcome, {companyName}</h1>
                <p>Manage your organisation&apos;s vacancies and recruitment activity.</p>
              </div>
              <Link className="employer-dashboard-primary-action" href="/employer/vacancies/new">
                <Plus aria-hidden="true" size={16} /> Create vacancy
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="employer-overview" aria-label="Hiring overview">
        {metrics.map((metric) => (
          <article className="employer-overview-card" key={metric.label}>
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
            <span>{metric.detail}</span>
          </article>
        ))}
      </section>

      <div className="employer-dashboard-panels">
        <section className="employer-dashboard-panel" aria-labelledby="recent-vacancies-title">
          <div className="employer-panel-heading">
            <h2 id="recent-vacancies-title">Recent vacancies</h2>
            <Link className="employer-panel-button" href="/employer/vacancies">View all</Link>
          </div>
          {vacancies.length ? (
            <div className="employer-vacancies-table-wrap">
              <table className="employer-vacancies-table">
                <thead>
                  <tr>
                    <th scope="col">Vacancy</th>
                    <th scope="col">Location</th>
                    <th scope="col">Applicants</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vacancies.slice(0, 4).map((job) => (
                    <tr key={job.id}>
                      <td><strong>{job.title}</strong><div className="muted small">{job.id}</div></td>
                      <td>{job.loc}</td>
                      <td>{myApplicants.filter((applicant) => applicant.jobId === job.id).length}</td>
                      <td><StatusBadge value={job.status} /></td>
                      <td><Link className="employer-panel-button" href="/employer/vacancies">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="employer-empty-vacancies">No records are available for this view.</p>
          )}
        </section>

        <section className="employer-dashboard-panel" aria-labelledby="quick-actions-title">
          <h2 id="quick-actions-title">Quick actions</h2>
          <div className="employer-quick-actions">
            {quickActions.map((action) => (
              <Link className="employer-quick-action" href={action.href} key={action.title}>
                <span className="employer-quick-action-icon" aria-hidden="true"><action.icon size={19} /></span>
                <strong>{action.title}</strong>
                <span>{action.description}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
