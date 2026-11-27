import { redirect } from "next/navigation";
import EmployerDashboardHeaderTools from "@/app/components/employer/EmployerDashboardHeaderTools";
import EmployerLogoutButton from "@/app/components/employer/employer-logout-button";
import EmployerSidebar from "@/app/components/employer/employer-sidebar";
import EmployerVacancyDetails from "@/app/components/employer/EmployerVacancyDetails";
import { getEmployerJobById } from "@/lib/employer-api";
import { BackendApiError } from "@/lib/backend-api";
import { getEmployerSession } from "@/lib/employer-session";
import type { Job } from "@/lib/data";

export default async function EmployerVacancyDetailsPage({
  params,
}: PageProps<"/employer/vacancies/[id]">) {
  const employer = await getEmployerSession();
  if (!employer) redirect("/employer/login");
  const { id } = await params;
  let initialJob: Job | null = null;
  let initialJobError: string | undefined;
  if (employer.accessToken) {
    try {
      initialJob = await getEmployerJobById(employer.accessToken, id);
    } catch (error) {
      console.error("Unable to load employer vacancy details.", error);
      initialJobError = error instanceof BackendApiError
        ? error.message
        : "Vacancy details could not be loaded.";
    }
  }

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
      <section className="employer-dashboard-main employer-vacancy-detail-page">
        <EmployerVacancyDetails
          initialJob={initialJob}
          initialJobError={initialJobError}
          jobId={id}
        />
      </section>
    </main>
  );
}
