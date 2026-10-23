"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import BrandMark from "@/app/components/brand-mark";

type AuthMode = "login" | "register" | "forgot" | "reset";

type EmployerAuthFormProps = {
  mode: AuthMode;
  token?: string;
};

const modeDetails: Record<AuthMode, { title: string; lead: string; endpoint: string }> = {
  login: {
    title: "Welcome back",
    lead: "Sign in to continue to your employer workspace.",
    endpoint: "/api/employer/login",
  },
  register: {
    title: "Create your account",
    lead: "Set up your employer account to get started.",
    endpoint: "/api/employer/register",
  },
  forgot: {
    title: "Reset your password",
    lead: "Enter your account email and we'll send a reset link if it exists.",
    endpoint: "/api/employer/forgot-password",
  },
  reset: {
    title: "Choose a new password",
    lead: "Set a new password for your employer account.",
    endpoint: "/api/employer/reset-password",
  },
};

export default function EmployerAuthForm({ mode, token }: EmployerAuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const details = modeDetails[mode];
  const hasToken = mode !== "reset" || Boolean(token);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const payload: Record<string, string> = {};
    for (const key of ["companyName", "email", "password"]) {
      const value = formData.get(key);
      if (typeof value === "string" && value) payload[key] = value;
    }
    if (mode === "reset" && token) payload.token = token;

    try {
      const response = await fetch(details.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => null)) as
        | { error?: string; message?: string }
        | null;

      if (!response.ok) {
        setError(result?.error ?? "We couldn't complete that request. Please try again.");
        return;
      }

      if (mode === "forgot") {
        setSuccess(result?.message ?? "If an account exists for that email, a reset link will be sent.");
        return;
      }

      if (mode === "reset") {
        setSuccess("Your password has been updated.");
        return;
      }

      router.replace("/employer/dashboard");
    } catch {
      setError("Unable to connect right now. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  const submitLabel = {
    login: "Log in",
    register: "Create account",
    forgot: "Send reset link",
    reset: "Update password",
  }[mode];
  const pendingLabel = {
    login: "Signing in...",
    register: "Creating account...",
    forgot: "Sending link...",
    reset: "Updating password...",
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
            ) : success ? (
              <div className="employer-auth-fields">
                <p className="employer-auth-success" role="status">{success}</p>
                <Link className="employer-auth-submit" href="/employer/login">
                  Return to sign in
                </Link>
              </div>
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

                <button className="employer-auth-submit" type="submit" disabled={pending}>
                  {pending ? pendingLabel : submitLabel}
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
            {mode === "reset" && !success && (
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