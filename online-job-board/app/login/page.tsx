'use client'; // Runs in the browser, it needs hooks, click handlers and the client side store

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HOME } from '@/lib/permissions';
import { useStore } from '@/lib/store';
import type { Role } from '@/lib/data';

//the user picks a role instead of entering credentials
export default function LoginPage() {
  const router = useRouter();
  const { role, ready, login } = useStore();

  /* If a session already exists (e.g. page refresh), skip the login screen
  and send the user straight to their role's home page
  We wait for 'ready' so we don't redirect before the saved session has loaded */
  useEffect(() => {
    if (ready && role) router.replace(HOME[role]);
  }, [ready, role, router]);

  /* Saves the chosen role in the store, then go to that role's home page
  router.replace (not push) stops the Back button returning to the login page */
  const signIn = (nextRole: Role) => {
    login(nextRole);
    router.replace(HOME[nextRole]);
  };

  /* While the store is loading or a redirect is about to happen,
  show a loading message so the login buttons don't flash on screen */
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
