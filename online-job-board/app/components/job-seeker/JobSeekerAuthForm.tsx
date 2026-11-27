"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { loginJobSeeker, registerJobSeeker, type JobSeekerActionState } from "@/app/actions/job-seeker";

export default function JobSeekerAuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const handledRedirect = useRef(false);
  const action = mode === "login" ? loginJobSeeker : registerJobSeeker;
  const [state, formAction, pending] = useActionState<JobSeekerActionState, FormData>(action, {});

  useEffect(() => {
    if (!state.redirectTo || handledRedirect.current) return;
    handledRedirect.current = true;
    router.replace(state.redirectTo);
    router.refresh();
  }, [router, state.redirectTo]);

  return (
    <main className={`job-seeker-auth-page online-account-auth-page${mode === "register" ? " unified-register-page" : ""}`}>
      <Link className="job-seeker-brand" href="/" aria-label="OnlineJobBoard home">
        <span>OnlineJobBoard</span>
      </Link>
      <section className="job-seeker-auth-frame online-account-auth-frame" aria-label="OnlineJobBoard account access">
        <div className="job-seeker-auth-content">
          <div className="job-seeker-auth-form-wrap online-account-auth-form-wrap">
            <p className="job-seeker-form-eyebrow">
              {mode === "login" ? "ONLINEJOBBOARD SIGN IN" : "CREATE AN ACCOUNT"}
            </p>
            <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
            <p className="job-seeker-auth-lead">
              {mode === "login"
                ? "Sign in to continue to your account workspace."
                : "Create your account with your personal details. You can request employer access from your dashboard for administrator review."}
            </p>
            <form action={formAction} className="job-seeker-auth-fields">
              {mode === "register" && (
                <>
                  <label className="job-seeker-auth-field">
                    Display name *
                    <input className="job-seeker-auth-input" autoComplete="nickname" maxLength={200} minLength={2} name="displayName" required />
                  </label>
                  <label className="job-seeker-auth-field">
                    Full legal name
                    <input className="job-seeker-auth-input" autoComplete="name" maxLength={200} name="fullName" />
                  </label>
                  <label className="job-seeker-auth-field">
                    Date of birth
                    <input className="job-seeker-auth-input" autoComplete="bday" name="dateOfBirth" type="date" />
                  </label>
                  <label className="job-seeker-auth-field">
                    Phone
                    <input className="job-seeker-auth-input" autoComplete="tel" maxLength={50} name="phone" type="tel" />
                  </label>
                  <label className="job-seeker-auth-field">
                    Location
                    <input className="job-seeker-auth-input" autoComplete="address-level2" maxLength={255} name="location" />
                  </label>
                  <label className="job-seeker-auth-field">
                    Professional biography
                    <textarea className="job-seeker-auth-input" maxLength={10000} name="biography" />
                  </label>
                </>
              )}
              <label className="job-seeker-auth-field">
                Email address
                <input className="job-seeker-auth-input" autoComplete="email" maxLength={254} name="email" required type="email" />
              </label>
              <label className="job-seeker-auth-field">
                Password
                <input
                  className="job-seeker-auth-input"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  maxLength={72}
                  minLength={mode === "register" ? 12 : undefined}
                  name="password"
                  required
                  type="password"
                />
              </label>
              {mode === "register" && (
                <>
                  <label className="job-seeker-auth-field">
                    Confirm password
                    <input className="job-seeker-auth-input" autoComplete="new-password" maxLength={72} minLength={12} name="confirmPassword" required type="password" />
                  </label>
                </>
              )}
              {mode === "login" && (
                <Link className="job-seeker-auth-link" href="/job-seeker/forgot-password">
                  Forgot password?
                </Link>
              )}
              {state.error && <p className="job-seeker-auth-error" role="alert">{state.error}</p>}
              <button className="job-seeker-auth-submit" disabled={pending} type="submit">
                {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>
            <p className="job-seeker-auth-switch">
              {mode === "login" ? "New to OnlineJobBoard?" : "Already have an account?"}
              <Link className="job-seeker-auth-link" href={mode === "login" ? "/register" : "/login"}>
                {mode === "login" ? "Create an account" : "Sign in"}
              </Link>
            </p>
            <p className="job-seeker-auth-switch">
              <Link className="job-seeker-auth-link" href="/jobs">Back to job listings</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
