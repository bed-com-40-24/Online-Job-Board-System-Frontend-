import Link from "next/link";
import { notFound } from "next/navigation";
import BrandMark from "@/app/components/brand-mark";
import AdminLogoutButton from "@/app/components/admin-logout-button";
import AdminSidebar from "@/app/components/admin-sidebar";
import { getRecentAdminEmployers } from "@/lib/admin-data";
import { getAdminSession } from "@/lib/admin-session";

const sections = {
  employers: {
    title: "Employer management",
    description: "Browse employer accounts registered on OnlineJobBoard.",
    detail: "Employer accounts are shown using the information currently stored in the database.",
  },
  verification: {
    title: "Employer verification",
    description: "Review employer verification requests and account status.",
    detail: "Employer verification is not connected yet. The current employer database does not include verification status.",
  },
  moderation: {
    title: "Job moderation",
    description: "Review submitted job postings and moderation decisions.",
    detail: "Job moderation is not connected yet. Job posting data is not currently available to the administrator workspace.",
  },
  activity: {
    title: "Activity monitoring",
    description: "Monitor administrative and platform activity.",
    detail: "Activity monitoring is not connected yet. The platform does not currently store an activity log.",
  },
  profile: {
    title: "My profile",
    description: "Administrator account details.",
    detail: "Your administrator identity is shown in the workspace navigation and account header.",
  },
} as const;

type AdminSection = keyof typeof sections;

function isAdminSection(section: string): section is AdminSection {
  return Object.hasOwn(sections, section);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

export default async function AdminSectionPage({
  params,
}: PageProps<"/admin/[section]">) {
  const { section } = await params;
  if (!isAdminSection(section)) notFound();

  const admin =
    (await getAdminSession()) ?? {
      id: "demo-admin",
      email: "admin@demo.local",
      fullName: "Demo Administrator",
    };

  const sectionInfo = sections[section];
  const employers = section === "employers" ? await getRecentAdminEmployers(50) : [];

  return (
    <main className="admin-workspace">
      <AdminSidebar currentSection={section} fullName={admin.fullName} />

      <header className="admin-topbar">
        <Link className="admin-topbar-brand" href="/admin/dashboard">
          <BrandMark />
          <span>OnlineJobBoard</span>
        </Link>
        <div className="admin-topbar-user">
          <span>{admin.email}</span>
          <AdminLogoutButton />
        </div>
      </header>

      <section className="admin-workspace-content">
        <div className="admin-page-heading">
          <div>
            <p className="admin-eyebrow">ADMINISTRATOR WORKSPACE</p>
            <h1>{sectionInfo.title}</h1>
            <p>{sectionInfo.description}</p>
          </div>
          <Link className="admin-back-link" href="/admin/dashboard">Back to overview</Link>
        </div>

        {section === "employers" ? (
          <section className="admin-panel" aria-labelledby="employer-directory-title">
            <div className="admin-panel-heading">
              <div>
                <h2 id="employer-directory-title">Employer directory</h2>
                <p>{employers.length} most recently registered account(s)</p>
              </div>
            </div>
            {employers.length ? (
              <div className="admin-table-wrap">
                <table className="admin-employer-table">
                  <thead>
                    <tr>
                      <th scope="col">Company</th>
                      <th scope="col">Email</th>
                      <th scope="col">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employers.map((employer) => (
                      <tr key={employer.id}>
                        <td>{employer.companyName}</td>
                        <td>{employer.email}</td>
                        <td>{formatDate(employer.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-empty-state">No employer accounts have been registered yet.</p>
            )}
          </section>
        ) : (
          <section className="admin-module-notice" role="status">
            <span aria-hidden="true">i</span>
            <div>
              <h2>Workspace status</h2>
              <p>{sectionInfo.detail}</p>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
