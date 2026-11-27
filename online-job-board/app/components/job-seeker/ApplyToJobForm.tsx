"use client";

import Link from "next/link";
import { useActionState } from "react";
import { applyForJob, type JobSeekerActionState } from "@/app/actions/job-seeker";

export default function ApplyToJobForm({
  jobId,
  signedIn,
}: {
  jobId: string;
  signedIn: boolean;
}) {
  const [state, formAction, pending] = useActionState<JobSeekerActionState, FormData>(applyForJob, {});
  if (!signedIn) {
    return (
      <div className="admin-panel">
        <p>Sign in or create a job seeker account to submit an application.</p>
        <Link className="admin-panel-button" href="/login">Sign in to apply</Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="admin-panel" encType="multipart/form-data">
      <input name="jobId" type="hidden" value={jobId} />
      <label className="employer-auth-field">
        Upload your CV (PDF, maximum 5 MB)
        <input accept="application/pdf,.pdf" name="cv" required type="file" />
      </label>
      <label className="employer-auth-field">
        Cover letter (optional)
        <textarea className="employer-auth-input" maxLength={10000} name="coverLetter" rows={5} />
      </label>
      {state.error && <p className="employer-auth-error" role="alert">{state.error}</p>}
      {state.success && (
        <p className="employer-auth-success" role="status">
          {state.success} <Link href="/job-seeker/applications">View your applications</Link>
        </p>
      )}
      <button className="admin-panel-button" disabled={pending} type="submit">
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
