"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import BrandMark from "@/app/components/brand-mark";

type AuthMode = "login" | "register" | "forgot" | "reset";

type EmployerAuthFormProps = {
  mode: AuthMode;
  token?: string;
};

const modeDetails: Record<AuthMode, { title: string; lead: string }> = {
  login: {
    title: "Welcome back",
    lead: "Sign in to continue to your employer workspace.",
  },
  register: {
    title: "Create your account",
    lead: "Set up your employer account to get started.",
  },
  forgot: {
    title: "Reset your password",
    lead: "Enter your account email and we'll send a reset link if it exists.",
  },
  reset: {
    title: "Choose a new password",
    lead: "Set a new password for your employer account.",
  },
};

export default function EmployerAuthForm({ mode, token }: EmployerAuthFormProps) {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const details = modeDetails[mode];
  const hasToken = mode !== "reset" || Boolean(token);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("Backend integration is not connected yet. Please try again after it is set up.");
  }

  const submitLabel = {
    login: "Log in",
    register: "Create account",
    forgot: "Send reset link",
    reset: "Update password",
  }[mode];
  return (
    <main className={`employer-auth-page${mode === "login" ? " employer-auth-login-page" : ""}`}>
      <Link className="employer-brand" href="/employer/login" aria-label="OnlineJobBoard home">
        <BrandMark />
        <span>OnlineJobBoard</span>
      </Link>

      <section className={`employer-auth-frame${mode === "login" ? " employer-auth-login-frame" : ""}`} aria-label="Employer account access">
        <aside className="employer-auth-aside">
          <div className="employer-aside-copy">
            <p className="employer-aside-label">EMPLOYER PORTAL</p>
            <h1>Build your next great team.</h1>
          </div>
          <p className="employer-aside-foot">A better connection starts here.</p>
        </aside>

        <div className="employer-auth-content">
          <div className="employer-auth-form-wrap">
            <p className="employer-form-eyebrow">{mode === "login" ? "WORKSPACE ACCESS" : "ACCOUNT ACCESS"}</p>
            <h2>{details.title}</h2>
            <p className="employer-auth-lead">{details.lead}</p>

            {!hasToken ? (
              <p className="employer-auth-error" role="alert">
                This reset link is missing or invalid. Request a new one to continue.
              </p>
            ) : (
              <form className="employer-auth-fields" onSubmit={handleSubmit}>
                {mode === "register" && (
                  <label className="employer-auth-field">
                    Company name
                    <input
                      className="employer-auth-input"
                      name="companyName"
                      type="text"
                      autoComplete="organization"
                      minLength={2}
                      maxLength={200}
                      required
                    />
                  </label>
                )}

                {(mode === "login" || mode === "register" || mode === "forgot") && (
                  <label className="employer-auth-field">
                    Email address
                    <input
                      className="employer-auth-input"
                      name="email"
                      type="email"
                      autoComplete="email"
                      maxLength={320}
                      required
                    />
                  </label>
                )}

                {(mode === "login" || mode === "register" || mode === "reset") && (
                  <div className="employer-auth-field">
                    <label htmlFor="employer-password">
                      {mode === "reset" ? "New password" : "Password"}
                    </label>
                    <div className="employer-password-wrap">
                      <input
                        className="employer-auth-input employer-password-input"
                        id="employer-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        minLength={mode === "login" ? undefined : 8}
                        maxLength={72}
                        required
                      />
                      <button
                        className="employer-password-toggle"
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((visible) => !visible)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} strokeWidth={2} aria-hidden="true" />
                        ) : (
                          <Eye size={18} strokeWidth={2} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {mode !== "login" && (
                      <span className="employer-auth-hint">Use at least 8 characters.</span>
                    )}
                  </div>
                )}

                {mode === "login" && (
                  <div className="employer-auth-row">
                    <Link className="employer-auth-link" href="/employer/forgot-password">
                      Forgot password?
                    </Link>
                  </div>
                )}

                {error && <p className="employer-auth-error" role="alert">{error}</p>}

                <button className="employer-auth-submit" type="submit">
                  {submitLabel}
                </button>
              </form>
            )}

            {mode === "login" && (
              <>
                <p className="employer-auth-switch">
                  New to OnlineJobBoard?
                  <Link className="employer-auth-link" href="/employer/register">Create an account</Link>
                </p>
                <p className="employer-auth-switch">
                  Administrator?
                  <Link className="employer-auth-link" href="/admin/login">Sign in here</Link>
                </p>
              </>
            )}
            {(mode === "register" || mode === "forgot") && (
              <p className="employer-auth-switch">
                Already have an account?
                <Link className="employer-auth-link" href="/employer/login">Log in</Link>
              </p>
            )}
            {mode === "reset" && (
              <p className="employer-auth-switch">
                <Link className="employer-auth-link" href="/employer/forgot-password">Request another reset link</Link>
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}