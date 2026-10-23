"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import BrandMark from "@/app/components/brand-mark";

type AdminAuthMode = "login" | "register" | "forgot" | "reset";

type AdminAuthFormProps = {
  mode: AdminAuthMode;
  token?: string;
};

const modeDetails: Record<AdminAuthMode, { title: string; lead: string }> = {
  login: {
    title: "Administrator sign in",
    lead: "Sign in to continue to the administration workspace.",
  },
  register: {
    title: "Create an administrator account",
    lead: "Administrator registration is only available to people with the private setup key.",
  },
  forgot: {
    title: "Reset your password",
    lead: "Enter your administrator email and we’ll send a reset link if it exists.",
  },
  reset: {
    title: "Choose a new password",
    lead: "Set a new password for your administrator account.",
  },
};

export default function AdminAuthForm({ mode, token }: AdminAuthFormProps) {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const details = modeDetails[mode];
  const hasToken = mode !== "reset" || Boolean(token);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("Backend integration is not connected yet. Please try again after it is set up.");
  }

  const submitLabel = {
    login: "Sign in",
    register: "Create administrator account",
    forgot: "Send reset link",
    reset: "Update password",
  }[mode];
  return (
    <main className="employer-auth-page employer-auth-login-page admin-auth-page">
      <Link className="employer-brand" href="/admin/login" aria-label="OnlineJobBoard administrator home">
        <BrandMark />
        <span>OnlineJobBoard</span>
      </Link>

      <section className="employer-auth-frame employer-auth-login-frame" aria-label="Administrator account access">
        <div className="employer-auth-content">
          <div className="employer-auth-form-wrap">
            <p className="employer-form-eyebrow">ADMINISTRATOR ACCESS</p>
            <h2>{details.title}</h2>
            <p className="employer-auth-lead">{details.lead}</p>

            {!hasToken ? (
              <p className="employer-auth-error" role="alert">
                This reset link is missing or invalid. Request a new one to continue.
              </p>
            ) : (
              <form className="employer-auth-fields" onSubmit={handleSubmit}>
                {mode === "register" && (
                  <>
                    <label className="employer-auth-field">
                      Full name
                      <input
                        className="employer-auth-input"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        minLength={2}
                        maxLength={100}
                        required
                      />
                    </label>
                    <div className="employer-auth-field">
                      <label htmlFor="admin-setup-key">Administrator setup key</label>
                      <input
                        className="employer-auth-input"
                        id="admin-setup-key"
                        name="setupKey"
                        type="password"
                        autoComplete="off"
                        aria-describedby="admin-setup-key-hint"
                        required
                      />
                      <span className="admin-password-hint" id="admin-setup-key-hint">
                        This private key is shared only with authorized administrators.
                      </span>
                    </div>
                  </>
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
                    <label htmlFor="admin-password">
                      {mode === "reset" ? "New password" : "Password"}
                    </label>
                    <div className="employer-password-wrap">
                      <input
                        className="employer-auth-input employer-password-input"
                        id="admin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        minLength={mode === "login" ? undefined : 12}
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
                      <span className="admin-password-hint">Use at least 12 characters.</span>
                    )}
                  </div>
                )}

                {mode === "login" && (
                  <div className="employer-auth-row">
                    <Link className="employer-auth-link" href="/admin/forgot-password">
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
                  Authorized administrator?
                  <Link className="employer-auth-link" href="/admin/register">Create an account</Link>
                </p>
                <p className="employer-auth-switch">
                  Employer?
                  <Link className="employer-auth-link" href="/employer/login">Employer sign in</Link>
                </p>
              </>
            )}
            {mode === "register" && (
              <p className="employer-auth-switch">
                Already registered?
                <Link className="employer-auth-link" href="/admin/login">Sign in</Link>
              </p>
            )}
            {mode === "forgot" && (
              <p className="employer-auth-switch">
                Remember your password?
                <Link className="employer-auth-link" href="/admin/login">Sign in</Link>
              </p>
            )}
            {mode === "reset" && (
              <p className="employer-auth-switch">
                <Link className="employer-auth-link" href="/admin/forgot-password">
                  Request another reset link
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
