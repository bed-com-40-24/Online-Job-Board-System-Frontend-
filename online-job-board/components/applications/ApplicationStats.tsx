type ApplicationStatsProps = {
  total: number;
  pending: number;
  shortlisted: number;
  rejected: number;
};

export default function ApplicationStats({
  total,
  pending,
  shortlisted,
  rejected,
}: ApplicationStatsProps) {
  return (
    <section
      className="stats-grid"
      aria-label="Application statistics"
    >
      <article className="stat-card">
        <div className="stat-top">
          <span>Total Applications</span>

          <span className="stat-icon" aria-hidden="true">
            ▤
          </span>
        </div>

        <div className="stat-value">{total}</div>

        <span className="muted">
          Applications received
        </span>
      </article>

      <article className="stat-card">
        <div className="stat-top">
          <span>Pending Review</span>

          <span className="stat-icon" aria-hidden="true">
            ◷
          </span>
        </div>

        <div className="stat-value">{pending}</div>

        <span className="muted">
          Awaiting a decision
        </span>
      </article>

      <article className="stat-card">
        <div className="stat-top">
          <span>Shortlisted</span>

          <span className="stat-icon" aria-hidden="true">
            ✓
          </span>
        </div>

        <div className="stat-value">{shortlisted}</div>

        <span className="muted">
          Selected candidates
        </span>
      </article>

      <article className="stat-card">
        <div className="stat-top">
          <span>Rejected</span>

          <span className="stat-icon" aria-hidden="true">
            ×
          </span>
        </div>

        <div className="stat-value">{rejected}</div>

        <span className="muted">
          Unsuccessful applications
        </span>
      </article>
    </section>
  );
}