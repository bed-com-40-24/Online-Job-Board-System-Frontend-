import { redirect } from "next/navigation";
import ApplicationsManager from "@/app/components/employer/ApplicationsManager";
import EmployerDashboardHeaderTools from "@/app/components/employer/EmployerDashboardHeaderTools";
import EmployerSidebar from "@/app/components/employer/employer-sidebar";
import EmployerLogoutButton from "@/app/components/employer/employer-logout-button";
import { getEmployerSession } from "@/lib/employer-session";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string | string[] }>;
}) {
  const employer = await getEmployerSession();
  if (!employer) redirect("/employer/login");
  const params = await searchParams;
  const jobId = typeof params.jobId === "string" ? params.jobId : undefined;

  return (
    <main className="employer-dashboard employer-dashboard-home">
      <EmployerSidebar companyName={employer.companyName} currentSection="applications" />
      <header className="employer-dashboard-header">
        <div className="workspace-brand-controls">
          <EmployerDashboardHeaderTools part="sidebar" />
        </div>
        <div className="employer-dashboard-user">
          <EmployerDashboardHeaderTools part="notifications" />
          <span className="employer-dashboard-email">{employer.email}</span>
          <EmployerLogoutButton />
        </div>
      </header>
      <section className="employer-dashboard-main employer-module-main employer-applications-page">
        <ApplicationsManager jobId={jobId} />
      </section>
    </main>
  );
}
