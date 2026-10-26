import type { Applicant, ApplicationStatus } from "../../data/applicants";

type ApplicationsTableProps = {
  applicants: Applicant[];
  onView: (applicant: Applicant) => void;
  onUpdateStatus: (
    applicantId: number,
    newStatus: ApplicationStatus
  ) => void;
  getInitials: (name: string) => string;
};

const statusClass: Record<ApplicationStatus, string> = {
  Pending: "status-pending",
  Shortlisted: "status-shortlisted",
  Rejected: "status-rejected",
};

export default function ApplicationsTable({
  applicants,
  onView,
  onUpdateStatus,
  getInitials,
}: ApplicationsTableProps) {
  return (
    <>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th scope="col">APPLICANT</th>
              <th scope="col">POSITION</th>
              <th scope="col">APPLIED DATE</th>
              <th scope="col">STATUS</th>
              <th scope="col">ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {applicants.map((applicant) => (
              <tr key={applicant.id}>
                <td>
                  <div className="applicant-cell">
                    <div className="person-avatar">
                      {getInitials(applicant.name)}
                    </div>

                    <div>
                      <strong>{applicant.name}</strong>
                      <span className="muted">
                        {applicant.email}
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="position-name">
                    {applicant.position}
                  </span>
                </td>

                <td>{applicant.appliedDate}</td>

                <td>
                  <span
                    className={`status ${statusClass[applicant.status]}`}
                  >
                    <span
                      className="status-dot"
                      aria-hidden="true"
                    />
                    {applicant.status}
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => onView(applicant)}
                    >
                      View
                    </button>

                    {applicant.status !== "Shortlisted" && (
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={() =>
                          onUpdateStatus(
                            applicant.id,
                            "Shortlisted"
                          )
                        }
                      >
                        Shortlist
                      </button>
                    )}

                    {applicant.status !== "Rejected" && (
                      <button
                        type="button"
                        className="button button-danger"
                        onClick={() =>
                          onUpdateStatus(
                            applicant.id,
                            "Rejected"
                          )
                        }
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {applicants.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            ⌕
          </div>

          <h3>No applications found</h3>

          <p>
            Try another search term or change the status filter.
          </p>
        </div>
      )}
    </>
  );
}