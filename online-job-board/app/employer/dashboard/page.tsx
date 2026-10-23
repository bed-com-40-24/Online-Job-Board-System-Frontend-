import Link from "next/link";
import { redirect } from "next/navigation";
import BrandMark from "@/app/components/brand-mark";
import EmployerLogoutButton from "@/app/components/employer-logout-button";
import EmployerSidebar from "@/app/components/employer-sidebar";
import { getEmployerSession } from "@/lib/employer-session";

const quickActions = [
  {
    icon: "＋",
    title: "Create vacancy",
    description: "Start a job posting",
    href: "/employer/vacancies",
  },
  {
    icon: "♟",
    title: "Review applicants",
    description: "Manage candidates",
    href: "/employer/applications",
  },
  {
    icon: "▤",
    title: "Manage vacancies",
    description: "Edit or close jobs",
    href: "/employer/vacancies",
  },
  {
    icon: "◉",
    title: "Company profile",
    description: "Update details",
    href: "/employer/profile",
  },
];

const metrics = [
  { label: "My vacancies", detail: "Owned by your account" },
  { label: "Applicants", detail: "Across your vacancies" },
  { label: "In review", detail: "Awaiting moderation" },
  { label: "Published", detail: "Currently visible" },
];

export default async function EmployerDashboardPage() {
  const employer = await getEmployerSession();
  if (!employer) redirect("/employer/login");

  return (
    <main className="employer-dashboard employer-dashboard-home">
      <EmployerSidebar companyName={employer.companyName} currentSection="dashboard" />

      <header className="employer-dashboard-header">
        <Link className="employer-brand" href="/employer/dashboard">
          <BrandMark />
          <span>OnlineJobBoard</span>
        </Link>
        <div className="employer-dashboard-user">
          <span className="employer-dashboard-email">{employer.email}</span>
          <EmployerLogoutButton />
        </div>
      </header>

      <section className="employer-dashboard-main">
        <div className="employer-dashboard-intro">
          <p className="employer-dashboard-kicker">EMPLOYER WORKSPACE</p>
          <div className="employer-dashboard-welcome">
            <div>
              <h1>Welcome, {employer.companyName}</h1>
              <p>Manage your organisation’s vacancies and recruitment activity.</p>
            </div>
            <Link className="employer-dashboard-primary-action" href="/employer/vacancies">
              <span aria-hidden="true">＋</span> Create vacancy
            </Link>
          </div>
        </div>

        <section className="employer-overview" aria-label="Hiring overview">
          {metrics.map((metric) => (
            <article className="employer-overview-card" key={metric.label}>
              <p>{metric.label}</p>
              <strong aria-label={`${metric.label} count unavailable`}>—</strong>
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
            <div className="employer-vacancies-table-wrap">
              <table className="employer-vacancies-table">
                <thead>
                  <tr>
                    <th scope="col">Vacancy</th>
                    <th scope="col">Type / location</th>
                    <th scope="col">Applicants</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
              </table>
              <p className="employer-empty-vacancies">
                Vacancy data will appear here when vacancy management is connected.
              </p>
            </div>
          </section>

          <section className="employer-dashboard-panel" aria-labelledby="quick-actions-title">
            <h2 id="quick-actions-title">Quick actions</h2>
            <div className="employer-quick-actions">
              {quickActions.map((action) => (
                <Link className="employer-quick-action" href={action.href} key={action.title}>
                  <span className="employer-quick-action-icon" aria-hidden="true">{action.icon}</span>
                  <strong>{action.title}</strong>
                  <span>{action.description}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
