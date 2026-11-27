import Link from "next/link";
import { getPublicJobs, isActivePublicJob, isClosedPublicJob, type PublicJob } from "@/lib/job-seeker-api";
import { BackendApiError } from "@/lib/backend-api";
import { getJobSeekerSession } from "@/lib/job-seeker-session";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; location?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const location = typeof params.location === "string" ? params.location : "";
  const applicant = await getJobSeekerSession();
  let jobs: PublicJob[] = [];
  let error = "";
  let signInRequired = false;
  try {
    jobs = await getPublicJobs({ query: q, location }, applicant?.accessToken);
  } catch (reason) {
    console.error("Unable to load public job listings.", reason);
    signInRequired = !applicant && reason instanceof BackendApiError && reason.status === 401;
    error = reason instanceof BackendApiError
      ? reason.message
      : "Job listings could not be loaded.";
  }

  return (
    <main className="public-home-page">
      <header className="public-header">
        <Link className="public-brand" href="/">OnlineJobBoard</Link>
        <nav className="public-header-actions" aria-label="Job seeker navigation">
          <Link className="public-sign-in" href="/login">Sign in</Link>
          <Link className="public-header-cta" href="/job-seeker/register">Create an account</Link>
        </nav>
      </header>
      <section className="public-home">
        <div className="public-hero-copy">
          <p className="public-eyebrow">CAREER OPPORTUNITIES</p>
          <h1>Find your next role.</h1>
          <p className="public-hero-lead">Explore vacancies and apply for roles that are still open.</p>
        </div>
        <form className="admin-panel" method="get">
          <label className="employer-auth-field">
            Job title or keywords
            <input className="employer-auth-input" defaultValue={q} maxLength={200} name="q" />
          </label>
          <label className="employer-auth-field">
            Location
            <input className="employer-auth-input" defaultValue={location} maxLength={255} name="location" />
          </label>
          <button className="admin-panel-button" type="submit">Search jobs</button>
        </form>

        {signInRequired ? (
          <p className="admin-panel" role="status">
            Sign in to browse the available jobs on this platform.{" "}
            <Link href="/login">Sign in</Link>
          </p>
        ) : error ? (
          <p className="admin-panel" role="alert">{error}</p>
        ) : jobs.length === 0 ? (
          <p className="admin-panel" role="status">No active jobs match your search.</p>
        ) : (
          <section aria-label="Job listings" className="public-features">
            {jobs.map((job) => (
              <article className="public-feature" key={job.id}>
                {isClosedPublicJob(job) && <span className="public-job-status public-job-status-closed">Closed</span>}
                <p className="public-eyebrow">{job.location}</p>
                <h2>{job.title}</h2>
                <p>{job.description}</p>
                <p>Apply by {job.dueDate}</p>
                {isActivePublicJob(job) ? (
                  <Link className="public-primary-action" href={`/jobs/${encodeURIComponent(job.id)}`}>
                    View job
                  </Link>
                ) : (
                  <p className="public-job-closed-note" role="status">This vacancy is closed and no longer accepting applications.</p>
                )}
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
