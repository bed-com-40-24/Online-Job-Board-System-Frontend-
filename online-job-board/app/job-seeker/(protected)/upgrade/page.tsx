import Link from "next/link";
import EmployerUpgradeForm from "@/app/components/job-seeker/EmployerUpgradeForm";
import { BackendApiError } from "@/lib/backend-api";
import { getJobSeekerEmployerRequests } from "@/lib/job-seeker-api";
import { getJobSeekerSession } from "@/lib/job-seeker-session";

export default async function EmployerUpgradePage() {
  const user = await getJobSeekerSession();
  if (!user) return null;

  let request: Awaited<ReturnType<typeof getJobSeekerEmployerRequests>>[number] | undefined;
  let error = "";
  try {
    const requests = await getJobSeekerEmployerRequests(user.accessToken);
    request = requests[0];
  } catch (reason) {
    console.error("Unable to load employer upgrade request status.", reason);
    error = reason instanceof BackendApiError
      ? reason.message
      : "Your employer request status could not be loaded.";
  }

  return (
    <section className="job-seeker-page">
      <p className="employer-dashboard-kicker">ACCOUNT UPGRADE</p>
      <h1>Apply to become an employer</h1>
      <p>
        Submit your business details for administrator review. Your job-seeker account
        remains available while your request is being reviewed.
      </p>
      {error ? (
        <p className="employer-auth-error" role="alert">{error}</p>
      ) : request ? (
        <div className="admin-panel">
          <h2>{request.companyName}</h2>
          <p>Request status: <strong>{request.status}</strong></p>
          {request.rejectionReason && <p>Administrator note: {request.rejectionReason}</p>}
          {request.status.toUpperCase() === "APPROVED" && (
            <p>
              Your employer request was approved.{" "}
              <Link href="/login">Sign in to continue</Link>.
            </p>
          )}
          {request.status.toUpperCase() === "PENDING" && (
            <p>Your request is waiting for an administrator to review it.</p>
          )}
          <Link className="admin-panel-button" href="/job-seeker/dashboard">Back to dashboard</Link>
        </div>
      ) : (
        <EmployerUpgradeForm email={user.email} />
      )}
    </section>
  );
}
