'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HOME } from '@/lib/permissions';
import { useStore } from '@/lib/store';
import type { Role } from '@/lib/data';

export default function LoginPage() {
  const router = useRouter();
  const { role, ready, login } = useStore();

  useEffect(() => {
    if (ready && role) router.replace(HOME[role]);
  }, [ready, role, router]);

  const signIn = (nextRole: Role) => {
    login(nextRole);
    router.replace(HOME[nextRole]);
  };

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
