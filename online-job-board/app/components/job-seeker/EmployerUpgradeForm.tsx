"use client";

import { FileCheck2, UploadCloud } from "lucide-react";
import { useActionState, useState } from "react";
import {
  submitEmployerUpgradeRequest,
  type JobSeekerActionState,
} from "@/app/actions/job-seeker";

export default function EmployerUpgradeForm({ email }: { email: string }) {
  const [certificateName, setCertificateName] = useState("");
  const [state, formAction, pending] = useActionState<JobSeekerActionState, FormData>(
    submitEmployerUpgradeRequest,
    {},
  );

  return (
    <form
      action={formAction}
      className="employer-auth-fields employer-auth-fields-register admin-panel"
    >
      <label className="employer-auth-field">
        Company name
        <input className="employer-auth-input" autoComplete="organization" maxLength={200} minLength={2} name="companyName" required />
      </label>
      <label className="employer-auth-field">
        Business description
        <textarea className="employer-auth-input" maxLength={10000} minLength={2} name="businessDescription" required />
      </label>
      <label className="employer-auth-field">
        Business location
        <input className="employer-auth-input" autoComplete="street-address" maxLength={255} minLength={2} name="physicalBusinessAddress" required />
      </label>
      <label className="employer-auth-field">
        Company phone number
        <input className="employer-auth-input" autoComplete="tel" maxLength={50} name="companyPhone" required type="tel" />
      </label>
      <label className="employer-auth-field">
        Business registration number
        <input className="employer-auth-input" maxLength={80} name="registrationNumber" required />
      </label>
      <label className="employer-auth-field">
        VAT / tax number
        <input className="employer-auth-input" maxLength={80} name="vatNumber" required />
      </label>
      <label className="employer-auth-field">
        Contact email
        <input className="employer-auth-input" autoComplete="email" readOnly value={email} />
      </label>
      <div className="employer-auth-field">
        <label htmlFor="employer-upgrade-certificate">Business registration certificate</label>
        <label className="employer-document-upload" htmlFor="employer-upgrade-certificate">
          {certificateName
            ? <FileCheck2 aria-hidden="true" size={22} />
            : <UploadCloud aria-hidden="true" size={22} />}
          <span>
            <strong>{certificateName ? "Certificate selected" : "Choose a certificate"}</strong>
            <small>{certificateName || "PDF document, up to 5 MB"}</small>
          </span>
        </label>
        <input
          accept="application/pdf,.pdf"
          className="employer-document-upload-input"
          id="employer-upgrade-certificate"
          name="businessRegistrationCertificateFile"
          required
          type="file"
          onChange={(event) => setCertificateName(event.currentTarget.files?.[0]?.name ?? "")}
        />
        <span className="employer-auth-hint">Upload a PDF certificate, up to 5 MB.</span>
      </div>
      {state.error && <p className="employer-auth-error" role="alert">{state.error}</p>}
      {state.success && <p className="employer-auth-success" role="status">{state.success}</p>}
      <button className="employer-auth-submit" disabled={pending} type="submit">
        {pending ? "Submitting…" : "Submit for administrator review"}
      </button>
    </form>
  );
}
