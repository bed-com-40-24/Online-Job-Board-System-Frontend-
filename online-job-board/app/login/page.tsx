'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_ACCOUNTS } from '@/lib/data';
import { HOME } from '@/lib/permissions';
import { useStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { role, ready, login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (ready && role) router.replace(HOME[role]);
  }, [ready, role, router]);

  const signIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const signedInRole = login(email, password);
    if (!signedInRole) {
      setError('Email or password is incorrect. Use one of the demo accounts below.');
      return;
    }
    router.replace(HOME[signedInRole]);
  };

  if (!ready || role) {
    return <main className="authwrap"><p role="status">Opening your workspace…</p></main>;
  }

  return (
    <main className="authwrap">
      <section className="auth-card">
        <p className="eyebrow">Online Job Board</p>
        <h1>Sign in to your workspace</h1>
        <p className="muted">Use a demo account to explore role-specific features.</p>
        <form onSubmit={signIn}>
          <div className="field">
            <label htmlFor="login-email">Email address</label>
            <input autoComplete="username" id="login-email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input autoComplete="current-password" id="login-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </div>
          {error && <p className="inline-error" role="alert">{error}</p>}
          <button className="primary full-width" type="submit">Sign in</button>
        </form>
        <section aria-label="Demo credentials" className="demo-accounts">
          <h2>Demo accounts</h2>
          {DEMO_ACCOUNTS.map((account) => (
            <div className="demo-account" key={account.role}>
              <strong>{account.role === 'admin' ? 'Administrator' : 'Employer'}</strong>
              <span>{account.email}</span>
              <code>{account.password}</code>
              <button
                className="text-button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                  setError('');
                }}
                type="button"
              >
                Use this account
              </button>
            </div>
          ))}
        </section>
        <p className="small muted">Demo records persist in this browser. Sign out to switch roles.</p>
      </section>
    </main>
  );
}
