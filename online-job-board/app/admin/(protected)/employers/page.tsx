import Link from "next/link";
import { redirect } from "next/navigation";
import AdminDashboardHeaderTools, { AdminDashboardMenuButton } from "@/app/components/admin/AdminDashboardHeaderTools";
import AdminEmployersManagement from "@/app/components/admin/AdminEmployersManagement";
import EmployerRequestsManagement, {
  type BackendUser,
  type EmployerRequest,
} from "@/app/components/admin/EmployerRequestsManagement";
import AdminSidebar from "@/app/components/admin/admin-sidebar";
import BrandMark from "@/app/components/shared/brand-mark";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
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
  throw new Error("The backend returned an unexpected employer management response.");
}

export default async function AdminEmployersPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  let requests: EmployerRequest[] = [];
  let users: BackendUser[] = [];
  let requestError = "";
  if (admin.accessToken) {
    try {
      const [requestsResponse, usersResponse] = await Promise.all([
        backendApiRequest<unknown>("/api/admin/employer-requests", { token: admin.accessToken }),
        backendApiRequest<unknown>("/api/admin/users", { token: admin.accessToken }),
      ]);
      requests = listFromResponse<EmployerRequest>(requestsResponse);
      users = listFromResponse<BackendUser>(usersResponse);
    } catch (error) {
      console.error("Unable to load backend employer requests.", error);
      requestError = error instanceof BackendApiError
        ? error.message
        : "Employer approval requests could not be loaded.";
    }
  }

  return (
    <main className="admin-workspace">
      <AdminSidebar backendMode={Boolean(admin.accessToken)} currentSection="employers" fullName={admin.fullName} />
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
            <h1>{admin.accessToken ? "Employer approval requests" : "Employer management"}</h1>
            <p>{admin.accessToken
              ? "Review and decide employer access requests from the backend."
              : "This local demo directory is not connected to the recruitment backend."}</p>
          </div>
        </div>
        {admin.accessToken
          ? requestError
            ? <p className="admin-panel" role="alert">{requestError}</p>
            : <EmployerRequestsManagement requests={requests} users={users} />
          : <AdminEmployersManagement />}
      </section>
    </main>
  );
}
