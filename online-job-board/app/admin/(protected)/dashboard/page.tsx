import Link from "next/link";
import { redirect } from "next/navigation";
import BrandMark from "@/app/components/shared/brand-mark";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
import AdminDashboardHeaderTools, { AdminDashboardMenuButton } from "@/app/components/admin/AdminDashboardHeaderTools";
import AdminDashboardOverview from "@/app/components/admin/AdminDashboardOverview";
import BackendAdminDashboardOverview from "@/app/components/admin/BackendAdminDashboardOverview";
import AdminSidebar from "@/app/components/admin/admin-sidebar";
import type { BackendUser, EmployerRequest } from "@/app/components/admin/EmployerRequestsManagement";
import { getAdminEmployerCount } from "@/lib/admin-data";
import { getAdminSession } from "@/lib/admin-session";
import { backendApiRequest, BackendApiError } from "@/lib/backend-api";

function listFromResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (typeof data === "object" && data !== null) {
    const record = data as { content?: unknown; items?: unknown; data?: unknown };
    if (Array.isArray(record.content)) return record.content as T[];
    if (Array.isArray(record.items)) return record.items as T[];
    if (Array.isArray(record.data)) return record.data as T[];
  }
  throw new Error("The backend returned an unexpected administrator dashboard response.");
}

export default async function AdminDashboardPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  const backendMode = Boolean(admin.accessToken);
  let employerCount: number | undefined;
  let users: BackendUser[] = [];
  let requests: EmployerRequest[] = [];
  let dashboardError = "";

  if (admin.accessToken) {
    try {
      const [usersResponse, requestsResponse] = await Promise.all([
        backendApiRequest<unknown>("/api/admin/users", { token: admin.accessToken }),
        backendApiRequest<unknown>("/api/admin/employer-requests", { token: admin.accessToken }),
      ]);
      users = listFromResponse<BackendUser>(usersResponse);
      requests = listFromResponse<EmployerRequest>(requestsResponse);
    } catch (error) {
      console.error("Unable to load backend administrator dashboard data.", error);
      dashboardError = error instanceof BackendApiError
        ? error.message
        : "The administrator dashboard data could not be loaded.";
    }
  } else {
    employerCount = await getAdminEmployerCount();
  }

  return (
    <main className="admin-workspace">
      <AdminSidebar backendMode={backendMode} currentSection="dashboard" fullName={admin.fullName} />

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

      <section className="admin-workspace-content">
        <div className="admin-page-heading">
          <HistoryNavigation fallbackHref="/admin/dashboard" />
          <div>
            <p className="admin-eyebrow">ADMINISTRATOR WORKSPACE</p>
            <h1>Platform overview</h1>
            {backendMode ? (
              <p>A live snapshot of employer accounts and access requests.</p>
            ) : (
              <p>Verify employers and monitor platform activity.</p>
            )}
          </div>
        </div>

        {backendMode
          ? dashboardError
            ? <p className="admin-panel" role="alert">{dashboardError}</p>
            : <BackendAdminDashboardOverview requests={requests} users={users} />
          : <AdminDashboardOverview employerCount={employerCount} />}
      </section>
    </main>
  );
}
