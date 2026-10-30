'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HOME, can } from '@/lib/permissions';
import { useStore } from '@/lib/store';
import { logoutAdmin, logoutEmployer } from '@/app/actions/auth';
import HistoryNavigation from '@/app/components/HistoryNavigation';

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, logout } = useStore();

  if (!role) return null;

  const links = [
    ...(can(role, 'applicant.update')
      ? [{ href: '/employer/applications', label: 'Applications' }]
      : []),
    ...(can(role, 'employer.verify')
      ? [
          { href: '/admin/verification', label: 'Employer verification' },
          { href: '/admin/jobs', label: 'Job posting review' },
        ]
      : []),
  ];

  const signOut = async () => {
    if (role === 'admin') {
      await logoutAdmin();
    } else {
      await logoutEmployer();
    }
    logout();
    router.replace(role === 'admin' ? '/admin/login' : '/employer/login');
    router.refresh();
  };

  return (
    <div className="app">
      <header className="topbar">
        <Link className="brand" href={HOME[role]}>
          <span className="logo">OJB</span>
          Online Job Board
        </Link>
        <HistoryNavigation fallbackHref={HOME[role]} />
        <div className="user-chip">
          <span>{role === 'employer' ? 'Employer workspace' : 'Administrator'}</span>
          <button className="secondary" type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>
      <aside className="side" aria-label="Workspace navigation">
        <nav className="nav">
          {links.map((link) => (
            <Link
              aria-current={pathname === link.href ? 'page' : undefined}
              className={pathname === link.href ? 'active' : ''}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
