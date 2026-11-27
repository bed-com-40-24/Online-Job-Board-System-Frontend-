import { redirect } from "next/navigation";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
import EmployerLogoutButton from "@/app/components/employer/employer-logout-button";
import EmployerSidebar from "@/app/components/employer/employer-sidebar";
import EmployerDashboardHeaderTools from "@/app/components/employer/EmployerDashboardHeaderTools";
import CreateVacancyForm from "@/app/components/employer/CreateVacancyForm";
import { getEmployerSession } from "@/lib/employer-session";

export default async function NewVacancyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const employer = await getEmployerSession();
  if (!employer) redirect("/employer/login");
  const params = await searchParams;
  const id = typeof params.id === "string" ? params.id : undefined;

  return (
    <main className="employer-dashboard employer-dashboard-home">
      <EmployerSidebar companyName={employer.companyName} currentSection="vacancies" />

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

      <section className="employer-dashboard-main employer-module-main create-vacancy-page">
        <div className="employer-page-heading">
          <HistoryNavigation fallbackHref="/employer/dashboard" />
          <div>
            <p className="employer-dashboard-kicker">EMPLOYER WORKSPACE</p>
            <h1>{id ? "Edit vacancy" : "Create a vacancy"}</h1>
            <p className="employer-module-description">
              {id ? "Update the vacancy details below." : "Enter the vacancy details below."}
            </p>
          </div>
        </div>
        <CreateVacancyForm jobId={id} />
      </section>
    </main>
  );
}
