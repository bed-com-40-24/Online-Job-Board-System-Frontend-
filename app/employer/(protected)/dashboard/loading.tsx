export default function EmployerDashboardLoading() {
  return (
    <main className="employer-dashboard employer-dashboard-home dashboard-loading" aria-busy="true">
      <aside className="employer-dashboard-sidebar dashboard-loading-sidebar">
        <div className="dashboard-loading-line dashboard-loading-nav" />
      </aside>
      <header className="employer-dashboard-header dashboard-loading-header">
        <div className="dashboard-loading-line dashboard-loading-brand" />
        <div className="dashboard-loading-line dashboard-loading-account" />
      </header>
      <section className="employer-dashboard-main">
        <div className="dashboard-loading-line dashboard-loading-kicker" />
        <div className="dashboard-loading-line dashboard-loading-title" />
        <div className="dashboard-loading-line dashboard-loading-copy" />
        <div className="employer-overview dashboard-loading-cards" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="employer-overview-card dashboard-loading-card" key={index}>
              <div className="dashboard-loading-line dashboard-loading-card-title" />
              <div className="dashboard-loading-line dashboard-loading-card-value" />
              <div className="dashboard-loading-line dashboard-loading-card-copy" />
            </div>
          ))}
        </div>
        <div className="employer-dashboard-panels" aria-hidden="true">
          <div className="employer-dashboard-panel dashboard-loading-panel" />
          <div className="employer-dashboard-panel dashboard-loading-panel" />
        </div>
      </section>
    </main>
  );
}
