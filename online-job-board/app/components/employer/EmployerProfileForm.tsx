"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import { updateEmployerCompanyName, type AuthFormState } from "@/app/actions/auth";
import { initials } from "@/app/components/shared/IdentityIcons";
import { StatusBadge } from "@/app/components/shared/StatusBadge";

type EmployerProfileFormProps = {
  address: string;
  companyName: string;
  contactName: string;
  email: string;
  industry: string;
  overview: string;
  phone: string;
  verification: string;
};

export default function EmployerProfileForm({
  address,
  companyName,
  contactName,
  email,
  industry,
  overview,
  phone,
  verification,
}: EmployerProfileFormProps) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    updateEmployerCompanyName,
    {},
  );
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoError, setPhotoError] = useState("");

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Choose an image file such as JPG or PNG.");
      event.target.value = "";
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setPhotoError("Choose an image smaller than 3 MB.");
      event.target.value = "";
      return;
    }
    setPhotoError("");
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  }

  return (
    <div className="employer-profile-layout">
      <aside className="employer-profile-summary">
        <div className="employer-profile-avatar">
          {photoPreview ? <img alt="Organisation profile preview" src={photoPreview} /> : initials(companyName)}
        </div>
        <h2>{companyName}</h2>
        <p className="employer-profile-email">{email}</p>
        <StatusBadge value={verification} />
        <div className="employer-profile-photo">
          <label htmlFor="organisation-profile-photo">Add organisation / profile photo</label>
          <input accept="image/*" id="organisation-profile-photo" onChange={choosePhoto} type="file" />
          <p>Choose a profile image (JPG, PNG or similar). The image will appear here so you can check it before leaving this page.</p>
          {photoError && <p className="employer-profile-photo-error" role="alert">{photoError}</p>}
        </div>
      </aside>

      <section className="employer-profile-form-panel" aria-labelledby="organisation-profile-title">
        <h2 id="organisation-profile-title">Organisation profile</h2>
        <form action={formAction} className="employer-profile-form">
          <div className="employer-profile-fields">
            <label className="employer-profile-field" htmlFor="profile-company-name">
              <span>Organisation name *</span>
              <input defaultValue={companyName} id="profile-company-name" maxLength={200} minLength={2} name="companyName" required />
            </label>
            <label className="employer-profile-field" htmlFor="profile-contact-name">
              <span>Contact person&apos;s name *</span>
              <input defaultValue={contactName} id="profile-contact-name" name="contactName" required />
            </label>
            <label className="employer-profile-field" htmlFor="profile-work-email">
              <span>Work email *</span>
              <input defaultValue={email} id="profile-work-email" name="email" required type="email" />
            </label>
            <label className="employer-profile-field" htmlFor="profile-phone">
              <span>Phone</span>
              <input defaultValue={phone} id="profile-phone" name="phone" type="tel" />
            </label>
            <label className="employer-profile-field" htmlFor="profile-industry">
              <span>Industry</span>
              <input defaultValue={industry} id="profile-industry" name="industry" />
            </label>
            <label className="employer-profile-field" htmlFor="profile-website">
              <span>Website</span>
              <input id="profile-website" name="website" type="url" />
            </label>
            <label className="employer-profile-field employer-profile-field-wide" htmlFor="profile-address">
              <span>Business address</span>
              <input defaultValue={address} id="profile-address" name="address" />
            </label>
            <label className="employer-profile-field employer-profile-field-wide" htmlFor="profile-overview">
              <span>Company overview</span>
              <textarea defaultValue={overview} id="profile-overview" name="overview" />
            </label>
          </div>
          {state.error && <p className="employer-profile-error" role="alert">{state.error}</p>}
          {state.success && <p className="employer-profile-success" role="status">{state.success}</p>}
          <button className="primary employer-profile-save" disabled={pending} type="submit">
            Save profile
          </button>
        </form>
      </section>
    </div>
  );
}
