'use client'; // This page uses browser-side hooks and click handlers.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HOME } from '@/lib/permissions';
import { useStore } from '@/lib/store';
import type { Role } from '@/lib/data';

export default function LoginPage() {
  const router = useRouter();
  // The role and ready flag tell us if a saved session is already available.
  const { role, ready, login } = useStore();

  // Send users with an existing session straight to their workspace.
  // Wait until the saved session has loaded before checking the role.
  useEffect(() => {
    if (ready && role) router.replace(HOME[role]);
  }, [ready, role, router]);

  // Save the selected role, then open that role's home page.
  const signIn = (nextRole: Role) => {
    login(nextRole);
    router.replace(HOME[nextRole]);
  };

  // Hide the login buttons while the session loads or the page redirects.
  if (!ready || role) {
    return (
      <main className="authwrap">
        <p role="status">Opening your workspace…</p>
      </main>
    );
  }

  return (
    <main className="authwrap">
      <section className="auth-card">
        <p className="eyebrow">Online Job Board</p>
        <h1>Choose a demo workspace</h1>
        <p className="muted">Sign in as an employer or administrator to explore the frontend demo.</p>
        <div className="role-options">
          <button className="primary" onClick={() => signIn('employer')} type="button">
            Continue as employer
          </button>
          <button className="secondary" onClick={() => signIn('admin')} type="button">
            Continue as administrator
          </button>
        </div>
        <p className="small muted">Demo data resets when this browser session ends.</p>
      </section>
    </main>
  );
}
