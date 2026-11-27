"use client";

import { useActionState } from "react";
import {
  updateJobSeekerProfile,
  type JobSeekerActionState,
} from "@/app/actions/job-seeker";
import type { JobSeekerProfile } from "@/lib/job-seeker-api";

export default function JobSeekerProfileForm({ profile }: { profile: Partial<JobSeekerProfile> }) {
  const [state, formAction, pending] = useActionState<JobSeekerActionState, FormData>(
    updateJobSeekerProfile,
    {},
  );
  return (
    <form action={formAction} className="admin-panel">
      <label className="employer-auth-field">
        Display name *
        <input className="employer-auth-input" defaultValue={profile.displayName} maxLength={200} minLength={2} name="displayName" required />
      </label>
      <label className="employer-auth-field">
        Full legal name
        <input className="employer-auth-input" defaultValue={profile.fullName} maxLength={200} name="fullName" />
      </label>
      <label className="employer-auth-field">
        Date of birth
        <input className="employer-auth-input" defaultValue={profile.dateOfBirth} name="dateOfBirth" type="date" />
      </label>
      <label className="employer-auth-field">
        Phone
        <input className="employer-auth-input" defaultValue={profile.phone} maxLength={50} name="phone" type="tel" />
      </label>
      <label className="employer-auth-field">
        Location
        <input className="employer-auth-input" defaultValue={profile.location} maxLength={255} name="location" />
      </label>
      <label className="employer-auth-field">
        Professional biography
        <textarea className="employer-auth-input" defaultValue={profile.biography} maxLength={10000} name="biography" />
      </label>
      {state.error && <p className="employer-auth-error" role="alert">{state.error}</p>}
      {state.success && <p className="employer-auth-success" role="status">{state.success}</p>}
      <button className="admin-panel-button" disabled={pending} type="submit">
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
