import { redirect } from "next/navigation";
import EmployerLogoutButton from "@/app/components/employer/employer-logout-button";
import EmployerSidebar from "@/app/components/employer/employer-sidebar";
import EmployerDashboardOverview from "@/app/components/employer/EmployerDashboardOverview";
import EmployerDashboardHeaderTools from "@/app/components/employer/EmployerDashboardHeaderTools";
import { BackendApiError } from "@/lib/backend-api";
import { getEmployerCompanyProfile } from "@/lib/employer-api";
import { getEmployerSession } from "@/lib/employer-session";

export default async function EmployerDashboardPage() {
  const employer = await getEmployerSession();
  if (!employer) redirect("/employer/login");
  let companyName = employer.companyName;
  let profileError = "";
  if (employer.accessToken) {
    try {
      const profile = await getEmployerCompanyProfile(employer.accessToken);
      if (profile) companyName = profile.name;
      else profileError = "No approved employer profile was found. Ask an administrator to review your employer request.";
    } catch (error) {
      console.error("Unable to load the employer company profile.", error);
      profileError = error instanceof BackendApiError
        ? error.message
        : "The company profile could not be loaded.";
    }
  }

  return (
    <main className="employer-dashboard employer-dashboard-home">
      <EmployerSidebar companyName={employer.companyName} currentSection="dashboard" />

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

      <section className="employer-dashboard-main">
        {profileError && <p className="employer-module-placeholder" role="alert">{profileError}</p>}
        <EmployerDashboardOverview companyName={companyName} />
      </section>
    </main>
  );
}
