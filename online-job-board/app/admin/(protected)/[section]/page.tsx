import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdminActivityMonitor from "@/app/components/admin/AdminActivityMonitor";
import AdminDashboardHeaderTools, { AdminDashboardMenuButton } from "@/app/components/admin/AdminDashboardHeaderTools";
import AdminProfileForm from "@/app/components/admin/AdminProfileForm";
import AdminSidebar from "@/app/components/admin/admin-sidebar";
import BrandMark from "@/app/components/shared/brand-mark";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
import { getAdminSession } from "@/lib/admin-session";

const sectionDetails = {
  activity: {
    title: "Platform activity",
    eyebrow: "ADMINISTRATOR WORKSPACE",
    description: "Review recent account, vacancy and moderation events.",
  },
  profile: {
    title: "My profile",
    eyebrow: "ADMINISTRATOR ACCOUNT",
    description: "View and update your administrator contact information.",
  },
} as const;

export default async function AdminSectionPage({
  params,
}: PageProps<"/admin/[section]">) {
  const { section } = await params;
  if (section !== "activity" && section !== "profile") notFound();

  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  const page = sectionDetails[section];

  return (
    <main className="admin-workspace">
      <AdminSidebar currentSection={section} fullName={admin.fullName} />
      <header className="admin-topbar">
        <div className="admin-topbar-brand-tools">
          <Link className="admin-topbar-brand" href="/admin/dashboard">
            <BrandMark />
            <span>OnlineJobBoard</span>
          </Link>
          <AdminDashboardMenuButton />
        </div>
        <AdminDashboardHeaderTools fullName={admin.fullName} />
      </header>

      <section className={`admin-workspace-content ${section === "profile" ? "admin-profile-page" : "admin-activity-page"}`}>
        <div className="admin-page-heading">
          <HistoryNavigation fallbackHref="/admin/dashboard" />
          <div>
            <p className="admin-eyebrow">{page.eyebrow}</p>
            <h1>{page.title}</h1>
            <p>{page.description}</p>
          </div>
        </div>

        {section === "activity" ? <AdminActivityMonitor /> : <AdminProfileForm email={admin.email} fullName={admin.fullName} />}
      </section>
    </main>
  );
}
