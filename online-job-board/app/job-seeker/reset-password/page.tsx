import JobSeekerPasswordResetForm from "@/app/components/job-seeker/JobSeekerPasswordResetForm";

export default async function JobSeekerResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;
  return <JobSeekerPasswordResetForm mode="reset" token={token} />;
}
