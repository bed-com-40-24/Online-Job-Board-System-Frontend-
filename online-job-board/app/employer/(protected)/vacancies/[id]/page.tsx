import Link from "next/link";
import { redirect } from "next/navigation";
import BrandMark from "@/app/components/shared/brand-mark";
import EmployerDashboardHeaderTools from "@/app/components/employer/EmployerDashboardHeaderTools";
import EmployerLogoutButton from "@/app/components/employer/employer-logout-button";
import EmployerSidebar from "@/app/components/employer/employer-sidebar";
import EmployerVacancyDetails from "@/app/components/employer/EmployerVacancyDetails";
import { getEmployerSession } from "@/lib/employer-session";

export default async function EmployerVacancyDetailsPage({
  params,
}: PageProps<"/employer/vacancies/[id]">) {
  const employer = await getEmployerSession();
  if (!employer) redirect("/employer/login");
  const { id } = await params;

  return (
    <main className="employer-dashboard employer-dashboard-home">
      <EmployerSidebar companyName={employer.companyName} currentSection="vacancies" />
      <header className="employer-dashboard-header">
        <div className="workspace-brand-controls">
          <Link className="employer-brand" href="/employer/dashboard">
            <BrandMark />
            <span>OnlineJobBoard</span>
          </Link>
          <EmployerDashboardHeaderTools part="sidebar" />
        </div>
        <div className="employer-dashboard-user">
          <EmployerDashboardHeaderTools part="notifications" />
          <span className="employer-dashboard-email">{employer.email}</span>
          <EmployerLogoutButton />
        </div>
      </header>
      <section className="employer-dashboard-main employer-vacancy-detail-page">
        <EmployerVacancyDetails jobId={id} />
      </section>
    </main>
  );
}
