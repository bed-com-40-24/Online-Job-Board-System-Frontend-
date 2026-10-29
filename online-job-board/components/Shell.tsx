'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HOME, can } from '@/lib/permissions';
import { useStore } from '@/lib/store';

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, logout, resetData, employers } = useStore();

  if (!role) return null;

  const links = [
    ...(can(role, 'job.manage')
      ? [
          { href: '/employer', label: 'Overview' },
          { href: '/employer/jobs', label: 'My vacancies' },
          { href: '/employer/applications', label: 'Applications' },
          { href: '/employer/activity', label: 'Activity' },
        ]
      : []),
    ...(can(role, 'employer.verify')
      ? [
          { href: '/admin', label: 'Overview' },
          { href: '/admin/employers', label: 'Employers' },
          { href: '/admin/verification', label: 'Employer verification' },
          { href: '/admin/jobs', label: 'Job posting review' },
          { href: '/admin/activity', label: 'Activity' },
        ]
      : []),
  ];

  const signOut = () => {
    logout();
    router.replace('/login');
  };

  const reset = () => {
    if (window.confirm('Reset all local demo records to the original sample data?')) resetData();
  };

  const employerName =
    employers.find((employer) => employer.id === 'emp-demo')?.name ?? 'Employer workspace';

  return (
    <div className="app">
      <header className="topbar">
        <Link className="brand" href={HOME[role]}>
          <span className="logo">OJB</span>
          Online Job Board
        </Link>
        <nav aria-label="Page history" className="page-arrows">
          <button
            aria-label="Go to previous page"
            className="page-arrow"
            onClick={() => router.back()}
            title="Go to previous page"
            type="button"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            aria-label="Go to next page"
            className="page-arrow"
            onClick={() => router.forward()}
            title="Go to next page"
            type="button"
          >
            <span aria-hidden="true">→</span>
          </button>
        </nav>
        <div className="user-chip">
          <span>{role === 'employer' ? employerName : 'Administrator'}</span>
          <button className="secondary reset-button" onClick={reset} type="button">
            Reset demo data
          </button>
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
