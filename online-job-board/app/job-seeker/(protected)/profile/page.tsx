import JobSeekerProfileForm from "@/app/components/job-seeker/JobSeekerProfileForm";
import { BackendApiError } from "@/lib/backend-api";
import { getJobSeekerProfile, type JobSeekerProfile } from "@/lib/job-seeker-api";
import { getJobSeekerSession } from "@/lib/job-seeker-session";

export default async function JobSeekerProfilePage() {
  const user = await getJobSeekerSession();
  if (!user) return null;
  let profile: Partial<JobSeekerProfile> = { displayName: user.displayName };
  let error = "";
  try {
    profile = await getJobSeekerProfile(user.accessToken);
  } catch (reason) {
    if (!(reason instanceof BackendApiError) || reason.status !== 404) {
      console.error("Unable to load job seeker profile.", reason);
      error = reason instanceof BackendApiError ? reason.message : "Profile could not be loaded.";
    }
  }

  return (
    <section className="job-seeker-page">
      <p className="employer-dashboard-kicker">JOB SEEKER ACCOUNT</p>
      <h1>My profile</h1>
      <p>Your profile is shared with employers when you apply to their vacancies.</p>
      {error && <p className="employer-auth-error" role="alert">{error}</p>}
      <JobSeekerProfileForm profile={profile} />
    </section>
  );
}
