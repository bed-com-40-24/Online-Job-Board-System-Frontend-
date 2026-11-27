import Link from "next/link";
import { getJobSeekerApplications, type JobSeekerApplication } from "@/lib/job-seeker-api";
import { getJobSeekerSession } from "@/lib/job-seeker-session";
import { BackendApiError } from "@/lib/backend-api";

export default async function JobSeekerApplicationsPage() {
  const user = await getJobSeekerSession();
  if (!user) return null;
  let applications: JobSeekerApplication[] = [];
  let error = "";
  try {
    applications = await getJobSeekerApplications(user.accessToken);
  } catch (reason) {
    console.error("Unable to load job seeker applications.", reason);
    error = reason instanceof BackendApiError
      ? reason.message
      : "Applications could not be loaded.";
  }

  return (
    <section className="job-seeker-page">
      <p className="employer-dashboard-kicker">JOB SEEKER WORKSPACE</p>
      <h1>My applications</h1>
      <p className="job-seeker-page-description">Track the status and details of the jobs you have applied for.</p>
      {error ? (
        <p className="employer-auth-error" role="alert">{error}</p>
      ) : applications.length === 0 ? (
        <p className="admin-panel" role="status">You have not submitted any applications yet. <Link href="/jobs">Browse jobs</Link></p>
      ) : (
        <div className="admin-table-wrap job-seeker-applications-table">
          <table className="admin-employer-table">
            <thead>
              <tr><th scope="col">Job</th><th scope="col">Location</th><th scope="col">Vacancy status</th><th scope="col">Submitted</th><th scope="col">Application status</th></tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td>{application.job?.title ?? "Job posting"}</td>
                  <td>{application.job?.location ?? "—"}</td>
                  <td>
                    {application.job?.status?.toUpperCase() === "CLOSED" ||
                    application.job?.status?.toUpperCase() === "EXPIRED" ? (
                      <span className="public-job-status public-job-status-closed">Closed</span>
                    ) : application.job?.status?.toUpperCase() === "ACTIVE" ? (
                      <span className="public-job-status public-job-status-open">Open</span>
                    ) : "—"}
                  </td>
                  <td>{Number.isNaN(Date.parse(application.submittedAt))
                    ? "—"
                    : new Date(application.submittedAt).toLocaleDateString()}</td>
                  <td>{application.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
