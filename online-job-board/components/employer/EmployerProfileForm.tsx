"use client";

import { useActionState } from "react";
import { updateEmployerCompanyName, type AuthFormState } from "@/app/actions/auth";

type EmployerProfileFormProps = {
  companyName: string;
  email: string;
};

export default function EmployerProfileForm({
  companyName,
  email,
}: EmployerProfileFormProps) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    updateEmployerCompanyName,
    {},
  );

  return (
    <section className="employer-dashboard-panel" aria-labelledby="company-profile-title">
      <h2 id="company-profile-title">Company details</h2>
      <p className="employer-module-description">
        The current account database supports updating the company name only.
      </p>
      <form action={formAction} className="employer-auth-fields">
        <label className="employer-auth-field" htmlFor="company-name">
          Company name
          <input
            className="employer-auth-input"
            defaultValue={companyName}
            id="company-name"
            maxLength={200}
            minLength={2}
            name="companyName"
            required
          />
        </label>
        <label className="employer-auth-field" htmlFor="company-email">
          Account email
          <input
            className="employer-auth-input"
            id="company-email"
            readOnly
            value={email}
          />
        </label>
        {state.error && <p className="employer-auth-error" role="alert">{state.error}</p>}
        {state.success && <p className="employer-auth-success" role="status">{state.success}</p>}
        <button className="employer-auth-submit" disabled={pending} type="submit">
          Save profile
        </button>
      </form>
    </section>
  );
}
