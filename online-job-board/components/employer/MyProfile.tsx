'use client';

import type { ChangeEvent, FormEvent } from 'react';
import type { Account, Page } from '@/lib/types';
import { initials } from '@/components/shared/IdentityIcons';
import { ScreenHeading } from './employerHelpers';

export type MyProfileProps = {
  user: Account;
  photoPreview: string;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSaveProfile: (event: FormEvent<HTMLFormElement>) => void;
  onNavigate: (page: Page) => void;
};

export function MyProfile({ user, photoPreview, onPhotoChange, onSaveProfile, onNavigate }: MyProfileProps) {
  const label = user.company || user.name;
  return (
    <>
      <ScreenHeading eyebrow="Employer account" title="My profile" subtitle="Manage your organisation details and primary contact information." onBack={() => onNavigate('dashboard')} />
      <div className="profile-layout">
        <div className="panel profile-summary">
          <div className="profile-avatar">{photoPreview || user.avatar ? <img src={photoPreview || user.avatar} alt="Profile" /> : initials(label)}</div>
          <h2>{label}</h2>
          <p className="muted">{user.email}</p>
          <div className="profile-photo">
            <label htmlFor="photo">Profile photo</label>
            <input id="photo" type="file" accept="image/*" onChange={onPhotoChange} />
            <p className="small muted">Upload an image up to 3 MB. Common image formats are supported.</p>
          </div>
        </div>
        <div className="panel">
          <h2>Organisation profile</h2>
          <form onSubmit={onSaveProfile}>
            <div className="formgrid">
              <div className="field"><label>Organisation name *</label><input name="company" required defaultValue={user.company || user.name} /></div>
              <div className="field"><label>Contact person&apos;s name *</label><input name="name" required defaultValue={user.name} /></div>
              <div className="field"><label>Email *</label><input name="email" type="email" required defaultValue={user.email} /></div>
              <div className="field"><label>Phone</label><input name="phone" defaultValue={user.phone || ''} /></div>
              <div className="field"><label>Industry</label><input name="industry" defaultValue={user.industry || ''} /></div>
              <div className="field"><label>Website</label><input name="website" type="url" defaultValue={user.website || ''} /></div>
              <div className="field wide"><label>Business address</label><input name="address" defaultValue={user.address || ''} /></div>
              <div className="field wide"><label>Company overview</label><textarea name="bio" defaultValue={user.bio || ''} /></div>
            </div>
            <button className="primary">Save profile</button>
          </form>
        </div>
      </div>
    </>
  );
}
