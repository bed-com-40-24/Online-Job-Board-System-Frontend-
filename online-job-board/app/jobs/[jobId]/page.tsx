import Link from "next/link";
import { notFound } from "next/navigation";
import ApplyToJobForm from "@/app/components/job-seeker/ApplyToJobForm";
import { BackendApiError } from "@/lib/backend-api";
import { getPublicJob, isActivePublicJob, isClosedPublicJob } from "@/lib/job-seeker-api";
import { getJobSeekerSession } from "@/lib/job-seeker-session";

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(jobId)) notFound();

  const applicant = await getJobSeekerSession();
  let job;
  try {
    job = await getPublicJob(jobId, applicant?.accessToken);
  } catch (error) {
    if (error instanceof BackendApiError && error.status === 404) notFound();
    if (error instanceof BackendApiError && error.status === 401 && !applicant) {
      return (
        <main className="public-home-page">
          <article className="public-home">
            <h1>Sign in to view this job</h1>
            <p>The current platform requires a job seeker account to view job details.</p>
            <Link className="public-primary-action" href="/login">Sign in</Link>
          </article>
        </main>
      );
    }
    console.error("Unable to load public job details.", error);
    return <p className="employer-auth-error" role="alert">Job details could not be loaded.</p>;
  }
  if (!isActivePublicJob(job) && !isClosedPublicJob(job)) notFound();
  const isOpen = isActivePublicJob(job);

  return (
    <main className="public-home-page">
      <header className="public-header">
        <Link className="public-brand" href="/jobs">OnlineJobBoard</Link>
        <Link className="public-sign-in" href={applicant ? "/job-seeker/dashboard" : "/login"}>
          {applicant ? "My account" : "Sign in"}
        </Link>
      </header>
      <article className="public-home">
        <Link href="/jobs">← Back to jobs</Link>
        <p className="public-eyebrow">{job.location}</p>
        <h1>{job.title}</h1>
        {!isOpen && <span className="public-job-status public-job-status-closed">Closed</span>}
        <p>Application deadline: {job.dueDate}</p>
        <section className="admin-panel">
          <h2>About the role</h2>
          <p>{job.description}</p>
          <h2>Requirements</h2>
          <p>{job.requiredQualifications}</p>
        </section>
        <section aria-label="Submit an application">
          {isOpen ? (
            <>
              <h2>Apply for this job</h2>
              <ApplyToJobForm jobId={job.id} signedIn={Boolean(applicant)} />
            </>
          ) : (
            <p className="public-job-closed-note" role="status">
              This vacancy is closed and is no longer accepting applications.
            </p>
          )}
        </section>
      </article>
    </main>
  );
}
