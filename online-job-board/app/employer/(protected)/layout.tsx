import { redirect } from "next/navigation";
import { getEmployerSession } from "@/lib/employer-session";
import { StoreProvider } from "@/lib/store";
import { getEmployerWorkspaceData } from "@/lib/employer-api";
import { BackendApiError } from "@/lib/backend-api";

export default async function ProtectedEmployerLayout({
  children,
}: LayoutProps<"/employer">) {
  const employer = await getEmployerSession();
  if (!employer) redirect("/employer/login");

  if (!employer.accessToken) {
    return <StoreProvider initialRole="employer">{children}</StoreProvider>;
  }

  let data: Awaited<ReturnType<typeof getEmployerWorkspaceData>> | undefined;
  let loadError: unknown;
  try {
    data = await getEmployerWorkspaceData(employer.accessToken);
  } catch (error) {
    loadError = error;
  }
  if (!data) {
    const error = loadError;
    console.error("Unable to load employer workspace data.", error);
    const message = error instanceof BackendApiError
      ? error.message
      : "Employer workspace data could not be loaded.";
    return <div className="employer-auth-error" role="alert">{message}</div>;
  }
  return (
    <StoreProvider
      initialRole="employer"
      initialJobs={data.jobs}
      initialApplicants={data.applicants}
      backendMode
    >
      {children}
    </StoreProvider>
  );
}
