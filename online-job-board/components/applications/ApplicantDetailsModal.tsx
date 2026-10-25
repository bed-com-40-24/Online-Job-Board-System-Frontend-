import type { Applicant, ApplicationStatus } from "../../data/applicants";

type ApplicantDetailsModalProps = {
  applicant: Applicant;
  onClose: () => void;
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

export default function ApplicantDetailsModal({
  applicant,
  onClose,
  onUpdateStatus,
  getInitials,
}: ApplicantDetailsModalProps) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="applicant-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="applicant-modal-title"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">APPLICATION DETAILS</p>
            <h2 id="applicant-modal-title">Applicant Profile</h2>
          </div>

          <button
            type="button"
            className="close-button"
            aria-label="Close applicant details"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-person">
          <div className="large-avatar">
            {getInitials(applicant.name)}
          </div>

          <div>
            <h3>{applicant.name}</h3>
            <span className="muted">{applicant.position}</span>

            <span className={`status ${statusClass[applicant.status]}`}>
              <span className="status-dot" aria-hidden="true" />
              {applicant.status}
            </span>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <span>Email address</span>
            <strong>{applicant.email}</strong>
          </div>

          <div className="detail-item">
            <span>Phone number</span>
            <strong>{applicant.phone}</strong>
          </div>

          <div className="detail-item">
            <span>Location</span>
            <strong>{applicant.location}</strong>
          </div>

          <div className="detail-item">
            <span>Experience</span>
            <strong>{applicant.experience}</strong>
          </div>

          <div className="detail-item">
            <span>Education</span>
            <strong>{applicant.education}</strong>
          </div>

          <div className="detail-item">
            <span>Application date</span>
            <strong>{applicant.appliedDate}</strong>
          </div>
        </div>

        <div className="skills-section">
          <h4>Skills</h4>

          <div className="skill-list">
            {applicant.skills.map((skill) => (
              <span className="skill-chip" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={onClose}
          >
            Close
          </button>

          {applicant.status !== "Rejected" && (
            <button
              type="button"
              className="button button-danger"
              onClick={() => onUpdateStatus(applicant.id, "Rejected")}
            >
              Reject application
            </button>
          )}

          {applicant.status !== "Shortlisted" && (
            <button
              type="button"
              className="button button-primary"
              onClick={() => onUpdateStatus(applicant.id, "Shortlisted")}
            >
              Shortlist applicant
            </button>
          )}
        </div>
      </section>
    </div>
  );
}