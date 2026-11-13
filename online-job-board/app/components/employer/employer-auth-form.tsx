"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  UploadCloud,
  UserRound,
} from "lucide-react";
import BrandMark from "@/app/components/shared/brand-mark";
import {
  loginEmployer,
  registerEmployer,
  requestEmployerPasswordReset,
  resetEmployerPassword,
  type AuthFormState,
} from "@/app/actions/auth";

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
  const [showPassword, setShowPassword] = useState(false);
  const [certificateName, setCertificateName] = useState("");
  const [certificateError, setCertificateError] = useState("");
  const router = useRouter();
  const authAction = mode === "register"
    ? registerEmployer
    : mode === "forgot"
      ? requestEmployerPasswordReset
      : mode === "reset"
        ? resetEmployerPassword
        : loginEmployer;
  const [actionState, formAction, pending] = useActionState<AuthFormState, FormData>(
    authAction,
    {},
  );
  const [remainingLockSeconds, setRemainingLockSeconds] = useState(0);
  const handledRedirect = useRef(false);
  const details = modeDetails[mode];
  const hasToken = mode !== "reset" || Boolean(token);
  const redirectTo = actionState.redirectTo;
  const loginLocked = mode === "login" && remainingLockSeconds > 0;

  useEffect(() => {
    if (!actionState.retryAfter) return;
    const expiresAt = Date.now() + actionState.retryAfter * 1000;
    const updateRemaining = () => {
      setRemainingLockSeconds(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    };
    updateRemaining();
    const interval = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(interval);
  }, [actionState.retryAfter]);

  useEffect(() => {
    if (!redirectTo || handledRedirect.current) return;
    handledRedirect.current = true;
    router.replace(redirectTo);
    router.refresh();
  }, [redirectTo, router]);

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

      <section
        className={`employer-auth-frame${mode === "login" ? " employer-auth-login-frame" : ""}${mode === "register" ? " employer-auth-register-frame" : ""}`}
        aria-label="Employer account access"
      >
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
              <form
                action={formAction}
                className={`employer-auth-fields${mode === "register" ? " employer-auth-fields-register" : ""}`}
              >
                {mode === "reset" && <input name="token" type="hidden" value={token ?? ""} />}
                {mode === "register" && (
                  <div className="employer-auth-field">
                    <label className="employer-auth-field-label" htmlFor="employer-company-name">Company name</label>
                    <div className="employer-auth-input-wrap">
                      <Building2 aria-hidden="true" className="employer-auth-input-icon" size={18} />
                      <input
                        className="employer-auth-input"
                        id="employer-company-name"
                        name="companyName"
                        type="text"
                        autoComplete="organization"
                        minLength={2}
                        maxLength={200}
                        required
                      />
                    </div>
                  </div>
                )}
                {mode === "register" && (
                  <>
                    <div className="employer-auth-field employer-auth-upload-field">
                      <label className="employer-auth-field-label" htmlFor="employer-certificate">Business registration certificate</label>
                      <label className="employer-auth-upload-control" htmlFor="employer-certificate">
                        <UploadCloud aria-hidden="true" size={22} />
                        <span className="employer-auth-upload-copy">
                          <strong className="employer-auth-upload-button">Choose a file</strong>
                          <span>{certificateName || "PDF or image, up to 5 MB"}</span>
                        </span>
                        <input
                          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                          id="employer-certificate"
                          name="businessRegistrationCertificateFile"
                          type="file"
                          aria-describedby="certificate-file-hint"
                          required
                          onChange={(event) => {
                            const file = event.currentTarget.files?.[0];
                            setCertificateError("");
                            if (file && file.size > 5 * 1024 * 1024) {
                              event.currentTarget.value = "";
                              setCertificateName("");
                              setCertificateError("Choose a file that is 5 MB or smaller.");
                              return;
                            }
                            setCertificateName(file?.name ?? "");
                          }}
                        />
                      </label>
                      <span className="employer-auth-hint" id="certificate-file-hint">
                        Accepted: PDF, JPEG, PNG or WebP.
                      </span>
                      {certificateError && <span className="employer-auth-error" role="alert">{certificateError}</span>}
                    </div>
                    <div className="employer-auth-field">
                      <label className="employer-auth-field-label" htmlFor="employer-address">Physical business address</label>
                      <div className="employer-auth-input-wrap">
                        <MapPin aria-hidden="true" className="employer-auth-input-icon" size={18} />
                        <input
                          className="employer-auth-input"
                          id="employer-address"
                          name="physicalBusinessAddress"
                          type="text"
                          autoComplete="street-address"
                          minLength={5}
                          maxLength={500}
                          required
                        />
                      </div>
                    </div>
                    <div className="employer-auth-field">
                      <label className="employer-auth-field-label" htmlFor="employer-phone">Company phone number</label>
                      <div className="employer-auth-input-wrap">
                        <Phone aria-hidden="true" className="employer-auth-input-icon" size={18} />
                        <input
                          className="employer-auth-input"
                          id="employer-phone"
                          name="companyPhone"
                          type="tel"
                          autoComplete="tel"
                          maxLength={20}
                          required
                        />
                      </div>
                    </div>
                    <div className="employer-auth-field">
                      <label className="employer-auth-field-label" htmlFor="employer-representative-name">Authorised business representative</label>
                      <div className="employer-auth-input-wrap">
                        <UserRound aria-hidden="true" className="employer-auth-input-icon" size={18} />
                        <input
                          className="employer-auth-input"
                          id="employer-representative-name"
                          name="representativeName"
                          type="text"
                          autoComplete="name"
                          minLength={2}
                          maxLength={100}
                          required
                        />
                      </div>
                    </div>
                    <div className="employer-auth-field">
                      <label className="employer-auth-field-label" htmlFor="employer-representative-position">Representative&apos;s position</label>
                      <div className="employer-auth-input-wrap">
                        <BriefcaseBusiness aria-hidden="true" className="employer-auth-input-icon" size={18} />
                        <input
                          className="employer-auth-input"
                          id="employer-representative-position"
                          name="representativePosition"
                          type="text"
                          minLength={2}
                          maxLength={100}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {(mode === "login" || mode === "register" || mode === "forgot") && (
                  <div className="employer-auth-field">
                    <label className="employer-auth-field-label" htmlFor="employer-email">Email address</label>
                    <div className="employer-auth-input-wrap">
                      <Mail aria-hidden="true" className="employer-auth-input-icon" size={18} />
                      <input
                        className="employer-auth-input"
                        id="employer-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        maxLength={320}
                        disabled={loginLocked}
                        required
                      />
                    </div>
                  </div>
                )}

                {(mode === "login" || mode === "register" || mode === "reset") && (
                  <div className="employer-auth-field">
                    <label htmlFor="employer-password">
                      {mode === "reset" ? "New password" : "Password"}
                    </label>
                    <div className="employer-password-wrap">
                      <LockKeyhole aria-hidden="true" className="employer-auth-input-icon employer-auth-password-icon" size={18} />
                      <input
                        className="employer-auth-input employer-password-input"
                        id="employer-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        minLength={mode === "login" ? undefined : 12}
                        maxLength={72}
                        disabled={loginLocked}
                        required
                      />
                      <button
                        className="employer-password-toggle"
                        type="button"
                        disabled={loginLocked}
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
                    {mode === "register" && (
                      <span className="employer-auth-hint">Use at least 12 characters, including uppercase and lowercase letters, a number, and a symbol.</span>
                    )}
                  </div>
                )}

                {mode === "register" && (
                  <div className="employer-auth-field">
                    <label className="employer-auth-field-label" htmlFor="employer-confirm-password">Confirm password</label>
                    <div className="employer-auth-input-wrap">
                      <LockKeyhole aria-hidden="true" className="employer-auth-input-icon" size={18} />
                      <input
                        className="employer-auth-input"
                        id="employer-confirm-password"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        minLength={12}
                        maxLength={72}
                        required
                      />
                    </div>
                  </div>
                )}

                {mode === "login" && (
                  <div className="employer-auth-row">
                    <Link className="employer-auth-link" href="/employer/forgot-password">
                      Forgot password?
                    </Link>
                  </div>
                )}

                {actionState.error && <p className="employer-auth-error" role="alert">{actionState.error}</p>}
                {loginLocked && (
                  <p className="employer-auth-error" role="status">
                    Sign-in is temporarily locked. Try again in {remainingLockSeconds} seconds.
                  </p>
                )}
                {actionState.success && <p className="employer-auth-success" role="status">{actionState.success}</p>}
                {actionState.resetUrl && (
                  <p className="employer-auth-switch">
                    <Link className="employer-auth-link" href={actionState.resetUrl}>Open demo password reset</Link>
                  </p>
                )}

                <button className="employer-auth-submit" disabled={pending || loginLocked} type="submit">
                  {loginLocked ? `Try again in ${remainingLockSeconds}s` : submitLabel}
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
