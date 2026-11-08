import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import BrandMark from "@/app/components/shared/brand-mark";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
import EmployerLogoutButton from "@/app/components/employer/employer-logout-button";
import EmployerSidebar from "@/app/components/employer/employer-sidebar";
import EmployerDashboardHeaderTools from "@/app/components/employer/EmployerDashboardHeaderTools";
import EmployerProfileForm from "@/app/components/employer/EmployerProfileForm";
import { getEmployerSession } from "@/lib/employer-session";
import { seedEmployers } from "@/lib/data";

const modules = {
  vacancies: {
    title: "Vacancies",
    description: "Create and manage the job openings your company shares.",
    detail: "Vacancy management is not connected yet.",
  },
  applications: {
    title: "Applications",
    description: "Review applications submitted to your vacancies.",
    detail: "Application management is not connected yet.",
  },
  profile: {
    title: "My profile",
    description: "Manage your organisation details and primary contact information.",
    detail: "Company profile management is not connected yet.",
  },
} as const;

type EmployerModule = keyof typeof modules;

function isEmployerModule(section: string): section is EmployerModule {
  return Object.hasOwn(modules, section);
}

export default async function EmployerModulePage({
  params,
}: PageProps<"/employer/[section]">) {
  const employer = await getEmployerSession();
  if (!employer) redirect("/employer/login");

  const { section } = await params;
  if (!isEmployerModule(section)) notFound();

  const moduleInfo = modules[section];
  const employerDetails = seedEmployers.find((entry) => entry.id === employer.id || entry.email === employer.email);

  return (
    <main className="employer-dashboard employer-dashboard-home">
      <EmployerSidebar companyName={employer.companyName} currentSection={section} />
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

      <section className={`employer-dashboard-main employer-module-main${section === "profile" ? " employer-profile-page" : ""}`}>
        <div className="employer-page-heading">
          <HistoryNavigation fallbackHref="/employer/dashboard" />
          <div>
            <p className="employer-dashboard-kicker">{section === "profile" ? "EMPLOYER ACCOUNT" : "EMPLOYER WORKSPACE"}</p>
            <h1>{moduleInfo.title}</h1>
            <p className="employer-module-description">{moduleInfo.description}</p>
          </div>
        </div>
        {section === "profile" ? (
          <EmployerProfileForm
            address={employerDetails?.address === "Lilongwe" ? "Lilongwe, Malawi" : employerDetails?.address ?? ""}
            companyName={employer.companyName}
            contactName={employerDetails?.contact ?? ""}
            email={employer.email}
            industry={employerDetails?.industry ?? ""}
            overview={employer.id === "emp-demo" ? "Building useful digital products and growing Malawi’s technology talent." : ""}
            phone={employerDetails?.phone ?? ""}
            verification={employerDetails?.status ?? "Pending verification"}
          />
        ) : (
          <div className="employer-module-placeholder" role="status">
            <span className="employer-module-placeholder-mark" aria-hidden="true">i</span>
            <div>
              <h2>Module coming soon</h2>
              <p>{moduleInfo.detail} You can return to your dashboard to choose another activity.</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
