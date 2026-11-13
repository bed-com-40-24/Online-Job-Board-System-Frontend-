export default function AdminDashboardLoading() {
  return (
    <main className="admin-workspace dashboard-loading" aria-busy="true">
      <aside className="admin-sidebar dashboard-loading-sidebar">
        <div className="dashboard-loading-line dashboard-loading-nav" />
      </aside>
      <header className="admin-topbar dashboard-loading-header">
        <div className="dashboard-loading-line dashboard-loading-brand" />
        <div className="dashboard-loading-line dashboard-loading-account" />
      </header>
      <section className="admin-workspace-content">
        <div className="dashboard-loading-line dashboard-loading-kicker" />
        <div className="dashboard-loading-line dashboard-loading-title" />
        <div className="dashboard-loading-line dashboard-loading-copy" />
        <div className="admin-overview-grid dashboard-loading-cards" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="admin-overview-card dashboard-loading-card" key={index}>
              <div className="dashboard-loading-line dashboard-loading-card-title" />
              <div className="dashboard-loading-line dashboard-loading-card-value" />
              <div className="dashboard-loading-line dashboard-loading-card-copy" />
            </div>
          ))}
        </div>
        <div className="admin-dashboard-panels" aria-hidden="true">
          <div className="admin-panel dashboard-loading-panel" />
          <div className="admin-panel dashboard-loading-panel" />
        </div>
      </section>
    </main>
  );
}
