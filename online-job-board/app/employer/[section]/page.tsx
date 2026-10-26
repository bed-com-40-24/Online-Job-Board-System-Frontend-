import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import BrandMark from "@/app/components/brand-mark";
import EmployerLogoutButton from "@/app/components/employer-logout-button";
import EmployerSidebar from "@/app/components/employer-sidebar";
import { getEmployerSession } from "@/lib/employer-session";

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
  applicants: {
    title: "Applicant management",
    description: "Keep track of applicants as they move through hiring.",
    detail: "Applicant management is not connected yet.",
  },
  profile: {
    title: "Company profile",
    description: "Review and update your employer account details.",
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
  const employer =
    (await getEmployerSession()) ?? {
      id: "demo-employer",
      email: "demo@company.com",
      companyName: "Demo Employer",
    };

  const { section } = await params;
  if (!isEmployerModule(section)) notFound();

  const moduleInfo = modules[section];

  return (
    <main className="employer-dashboard employer-dashboard-home">
      <EmployerSidebar companyName={employer.companyName} currentSection={section} />
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

      <section className="employer-dashboard-main employer-module-main">
        <Link className="employer-module-back" href="/employer/dashboard">
          <span aria-hidden="true">&larr;</span> Back to dashboard
        </Link>
        <p className="employer-dashboard-kicker">EMPLOYER WORKSPACE</p>
        <h1>{moduleInfo.title}</h1>
        <p className="employer-module-description">{moduleInfo.description}</p>
        <div className="employer-module-placeholder" role="status">
          <span className="employer-module-placeholder-mark" aria-hidden="true">i</span>
          <div>
            <h2>Module coming soon</h2>
            <p>{moduleInfo.detail} You can return to your dashboard to choose another activity.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
