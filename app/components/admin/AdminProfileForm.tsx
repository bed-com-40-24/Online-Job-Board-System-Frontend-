"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

type AdminProfile = { fullName: string; email: string; phone: string; department: string; photo: string };

export default function AdminProfileForm({ fullName, email }: { fullName: string; email: string }) {
  const storageKey = "ojb-admin-profile";
  const [profile, setProfile] = useState<AdminProfile>({ fullName, email, phone: "+265 888 555 010", department: "Platform Administration", photo: "" });
  const [saved, setSaved] = useState(false);
  const initials = useMemo(() => profile.fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join(""), [profile.fullName]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) setProfile((current) => ({ ...current, ...JSON.parse(stored) as Partial<AdminProfile> }));
      } catch {
        // The form remains editable if browser storage is unavailable.
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function updateField(field: keyof AdminProfile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateField("photo", typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(profile));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  return (
    <div className="admin-profile-grid">
      <section aria-label="Administrator profile summary" className="admin-profile-summary-card">
        {profile.photo ? <img alt="Administrator profile" className="admin-profile-photo" src={profile.photo} /> : <div aria-hidden="true" className="admin-profile-initials">{initials || "AD"}</div>}
        <strong>{profile.fullName}</strong>
        <span className="admin-profile-email">{profile.email}</span>
        <span className="admin-profile-role">Administrator</span>
        <label className="admin-profile-photo-label" htmlFor="admin-profile-photo">Add administrator photo</label>
        <input accept="image/png,image/jpeg,image/webp" id="admin-profile-photo" onChange={choosePhoto} type="file" />
        <p>Choose a profile image (JPG, PNG or similar). The image will appear here so you can check it before leaving this page.</p>
      </section>

      <form className="admin-profile-form-card" onSubmit={saveProfile}>
        <h2>Administrator information</h2>
        <div className="admin-profile-fields">
          <label>Full name<input onChange={(event) => updateField("fullName", event.target.value)} required value={profile.fullName} /></label>
          <label>Email<input onChange={(event) => updateField("email", event.target.value)} required type="email" value={profile.email} /></label>
          <label>Phone<input onChange={(event) => updateField("phone", event.target.value)} type="tel" value={profile.phone} /></label>
          <label>Department<input onChange={(event) => updateField("department", event.target.value)} value={profile.department} /></label>
        </div>
        <button className="admin-profile-save" type="submit">Save profile</button>
        {saved && <p className="admin-profile-saved" role="status">Profile details saved on this device.</p>}
        <p className="admin-profile-security-note">Administrator accounts must be provisioned securely, not self-registered.</p>
      </form>
    </div>
  );
}
