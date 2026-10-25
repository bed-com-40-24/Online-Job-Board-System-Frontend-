import { redirect } from "next/navigation";

export default function Home() {
  redirect("/employer/login");
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HOME } from '@/lib/permissions';
import { useStore } from '@/lib/store';

export default function HomePage() {
  const router = useRouter();
  const { role, ready } = useStore();

  useEffect(() => {
    if (ready) {
      router.replace(role ? HOME[role] : '/login');
    }
  }, [ready, role, router]);

  return (
    <main className="authwrap">
      <p role="status">Opening your workspace…</p>
    </main>
  );
}
