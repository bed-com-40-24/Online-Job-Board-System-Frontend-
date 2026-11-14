'use client';

import { useEffect } from 'react';

export default function EmployerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Employer section error:', error);
  }, [error]);

  return (
    <main className="content">
      <section className="panel" role="alert">
        <h1>Something went wrong</h1>
        <p className="muted">
          We could not load this employer page. Your work may still be available.
          Please try again.
        </p>
        <button type="button" className="primary" onClick={reset}>
          Try again
        </button>
      </section>
    </main>
  );
}
