'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { HOME } from '@/lib/permissions';
import { useStore } from '@/lib/store';
import type { Role } from '@/lib/data';

export default function RoleGate({
  role: requiredRole,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { role, ready } = useStore();

  useEffect(() => {
    if (ready && !role) router.replace('/login');
  }, [ready, role, router]);

  if (!ready || !role) {
    return (
      <main className="authwrap">
        <p role="status">Checking access…</p>
      </main>
    );
  }

  if (role !== requiredRole) {
    return (
      <main className="authwrap">
        <section className="auth-card">
          <p className="eyebrow">403</p>
          <h1>Access denied</h1>
          <p className="muted">You don’t have permission to view this workspace.</p>
          <Link className="button-link primary" href={HOME[role]}>
            Return to your workspace
          </Link>
        </section>
      </main>
    );
  }

  return children;
}
