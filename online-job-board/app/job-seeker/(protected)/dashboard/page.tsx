import Link from "next/link";
import { getJobSeekerSession } from "@/lib/job-seeker-session";
import { getJobSeekerEmployerRequests } from "@/lib/job-seeker-api";
import { BackendApiError } from "@/lib/backend-api";

export default async function JobSeekerDashboardPage() {
  const user = await getJobSeekerSession();
  if (!user) return null;

  let employerRequestStatus = "";
  let requestError = "";
  try {
    const requests = await getJobSeekerEmployerRequests(user.accessToken);
    employerRequestStatus = requests[0]?.status ?? "";
  } catch (reason) {
    console.error("Unable to load employer upgrade request status.", reason);
    requestError = reason instanceof BackendApiError
      ? reason.message
      : "Employer request status could not be loaded.";
  }

  return (
    <section className="job-seeker-page job-seeker-dashboard-page">
      <div className="job-seeker-page-heading">
        <div>
          <p className="employer-dashboard-kicker">ACCOUNT WORKSPACE</p>
          <h1>Your account</h1>
          <p>Request employer access by submitting your organization details for administrator review.</p>
        </div>
        {!employerRequestStatus && (
          <Link className="job-seeker-heading-action" href="/job-seeker/upgrade">Upgrade to employer</Link>
        )}
      </div>
      {requestError && <p className="employer-auth-error" role="alert">{requestError}</p>}
      <article className="job-seeker-dashboard-card employer-upgrade-dashboard-card">
        <span className="job-seeker-card-label">EMPLOYER ACCESS</span>
        <h2>{employerRequestStatus ? "Employer access request" : "Upgrade your account"}</h2>
        <p>
          {employerRequestStatus
            ? `Your employer request is ${employerRequestStatus.toLowerCase()}.`
            : "Submit your organization details and registration certificate for administrator review."}
        </p>
        <Link href="/job-seeker/upgrade">
          {employerRequestStatus ? "View request" : "Start employer upgrade"}
        </Link>
      </article>
    </section>
  );
}
