type ApplicationFiltersProps = {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export default function ApplicationFilters({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: ApplicationFiltersProps) {
  return (
    <div className="filters">
      <label className="search-box">
        <span aria-hidden="true">⌕</span>

        <input
          type="search"
          placeholder="Search applicants, jobs or skills..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Search applicants"
        />
      </label>

      <label className="filter-select">
        <span className="sr-only">
          Filter by application status
        </span>

        <select
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="All">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </label>
    </div>
  );
}