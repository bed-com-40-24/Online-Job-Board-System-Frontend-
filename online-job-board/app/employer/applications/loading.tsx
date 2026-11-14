export default function ApplicationsLoading() {
  return (
    <main className="content" aria-busy="true" aria-label="Loading applications">
      <header className="page-head">
        <p className="eyebrow">Employer workspace</p>
        <h1>Loading applications...</h1>
        <p className="muted">Please wait while your applications are loaded.</p>
      </header>
      <section className="panel" role="status">
        <p className="muted">Preparing applicant information...</p>
      </section>
    </main>
  );
}
