"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { loginAccount, type AuthFormState } from "@/app/actions/auth";

export default function UnifiedLoginForm() {
  const router = useRouter();
  const handledRedirect = useRef(false);
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(loginAccount, {});

  useEffect(() => {
    if (!state.redirectTo || handledRedirect.current) return;
    handledRedirect.current = true;
    router.replace(state.redirectTo);
    router.refresh();
  }, [router, state.redirectTo]);

  return (
    <main className="job-seeker-auth-page online-account-auth-page unified-login-page">
      <Link className="job-seeker-brand" href="/" aria-label="OnlineJobBoard home">
        <span>OnlineJobBoard</span>
      </Link>
      <section className="job-seeker-auth-frame online-account-auth-frame" aria-label="Account sign in">
        <div className="job-seeker-auth-content">
          <div className="job-seeker-auth-form-wrap online-account-auth-form-wrap">
            <p className="job-seeker-form-eyebrow">ONLINEJOBBOARD ACCOUNT ACCESS</p>
            <h1>Welcome back</h1>
            <p className="job-seeker-auth-lead">
              Sign in with your account. We&apos;ll open the right workspace for your role.
            </p>
            <form action={formAction} className="job-seeker-auth-fields">
              <label className="job-seeker-auth-field">
                Email address
                <input
                  className="job-seeker-auth-input"
                  autoComplete="email"
                  maxLength={254}
                  name="email"
                  required
                  type="email"
                />
              </label>
              <label className="job-seeker-auth-field">
                Password
                <input
                  className="job-seeker-auth-input"
                  autoComplete="current-password"
                  maxLength={72}
                  name="password"
                  required
                  type="password"
                />
              </label>
              <Link className="job-seeker-auth-link" href="/forgot-password">
                Forgot password?
              </Link>
              {state.error && <p className="job-seeker-auth-error" role="alert">{state.error}</p>}
              <button className="job-seeker-auth-submit" disabled={pending} type="submit">
                {pending ? "Signing in…" : "Sign in"}
              </button>
            </form>
            <p className="job-seeker-auth-switch">
              New to OnlineJobBoard?
              <Link className="job-seeker-auth-link" href="/register">Create account</Link>
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
