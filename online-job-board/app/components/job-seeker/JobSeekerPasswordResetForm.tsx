"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestJobSeekerPasswordReset,
  resetJobSeekerPassword,
  type JobSeekerActionState,
} from "@/app/actions/job-seeker";

export default function JobSeekerPasswordResetForm({
  mode,
  token,
}: {
  mode: "forgot" | "reset";
  token?: string;
}) {
  const action = mode === "forgot" ? requestJobSeekerPasswordReset : resetJobSeekerPassword;
  const [state, formAction, pending] = useActionState<JobSeekerActionState, FormData>(action, {});
  return (
    <main className="job-seeker-auth-page online-account-auth-page">
      <Link className="job-seeker-brand" href="/" aria-label="OnlineJobBoard home">
        <span>OnlineJobBoard</span>
      </Link>
      <section className="job-seeker-auth-frame online-account-auth-frame" aria-label="Account recovery">
        <div className="job-seeker-auth-content">
          <div className="job-seeker-auth-form-wrap online-account-auth-form-wrap">
            <p className="job-seeker-form-eyebrow">ACCOUNT RECOVERY</p>
            <h1>{mode === "forgot" ? "Reset your password" : "Choose a new password"}</h1>
            <p className="job-seeker-auth-lead">
              {mode === "forgot"
                ? "Enter your account email to request a password reset link."
                : "Set a new password for your account."}
            </p>
            {mode === "reset" && !token ? (
              <p className="job-seeker-auth-error" role="alert">This reset link is missing its token. Request another link.</p>
            ) : (
              <form action={formAction} className="job-seeker-auth-fields">
                {mode === "forgot" ? (
                  <label className="job-seeker-auth-field">
                    Email address
                    <input className="job-seeker-auth-input" autoComplete="email" maxLength={254} name="email" required type="email" />
                  </label>
                ) : (
                  <>
                    <input name="resetToken" type="hidden" value={token} />
                    <label className="job-seeker-auth-field">
                      New password
                      <input className="job-seeker-auth-input" autoComplete="new-password" maxLength={72} minLength={12} name="password" required type="password" />
                    </label>
                    <label className="job-seeker-auth-field">
                      Confirm new password
                      <input className="job-seeker-auth-input" autoComplete="new-password" maxLength={72} minLength={12} name="confirmPassword" required type="password" />
                    </label>
                  </>
                )}
                {state.error && <p className="job-seeker-auth-error" role="alert">{state.error}</p>}
                {state.success && <p className="job-seeker-auth-success" role="status">{state.success}</p>}
                <button className="job-seeker-auth-submit" disabled={pending} type="submit">
                  {pending ? "Please wait…" : mode === "forgot" ? "Send reset link" : "Update password"}
                </button>
              </form>
            )}
            <p className="job-seeker-auth-switch">
              <Link className="job-seeker-auth-link" href="/login">Back to sign in</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
