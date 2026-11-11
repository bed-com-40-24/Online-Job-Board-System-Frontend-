export function StatusBadge({ value }: { value: string }) {
  const statusClass = /Verified|Published|Approved|Shortlisted|Hired/.test(value)
    ? 'good'
    : /Rejected|Closed/.test(value)
      ? 'bad'
      : /Pending|review|Draft|New/.test(value)
        ? 'warn'
        : '';

  return <span className={`badge ${statusClass}`}>{value}</span>;
}
