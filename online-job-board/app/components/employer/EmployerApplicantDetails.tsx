"use client";

import { useState } from "react";
import ReasonDialog from "@/app/components/shared/ReasonDialog";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
import { APP_STATUSES, type AppStatus } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function EmployerApplicantDetails({ applicantId }: { applicantId: string }) {
  const { myApplicants, setApplicantStatus } = useStore();
  const applicant = myApplicants.find((entry) => entry.id === applicantId);
  const [nextStatus, setNextStatus] = useState<AppStatus | "">("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [message, setMessage] = useState("");

  if (!applicant) {
    return (
      <section className="employer-vacancy-not-found">
        <div className="employer-page-heading">
          <HistoryNavigation fallbackHref="/employer/applications" />
          <div>
            <p className="employer-dashboard-kicker">APPLICANT DETAILS</p>
            <h1>Applicant not found</h1>
          </div>
        </div>
      </section>
    );
  }
  const selectedApplicant = applicant;

  const currentStatus: AppStatus = selectedApplicant.status === "Pending" ? "New" : selectedApplicant.status === "Accepted" ? "Shortlisted" : selectedApplicant.status;
  const selectedStatus = nextStatus || currentStatus;

  function saveStatus(status: AppStatus, reason?: string, note?: string) {
    const updated = setApplicantStatus(selectedApplicant.id, status, reason, note);
    setMessage(updated ? "Application status saved." : "The application status could not be updated.");
    if (updated) setNextStatus(status);
    return updated;
  }

  function handleSaveStatus() {
    if (selectedStatus === "Rejected") {
      setShowRejectDialog(true);
      return;
    }
    saveStatus(selectedStatus);
  }

  return (
    <>
      <div className="employer-applicant-detail-heading">
        <div className="employer-applicant-detail-heading-main">
          <HistoryNavigation fallbackHref="/employer/applications" />
          <div>
            <p className="employer-dashboard-kicker">APPLICANT DETAILS</p>
            <h1>{selectedApplicant.name}</h1>
            <p>Review candidate information and update recruitment status.</p>
          </div>
        </div>
      </div>

      <div className="employer-applicant-detail-grid">
        <section className="employer-applicant-detail-panel" aria-labelledby="applicant-summary-title">
          <h2 id="applicant-summary-title">{selectedApplicant.name}</h2>
          <p className="employer-applicant-email">{selectedApplicant.email}</p>
          <p><strong>Applied for:</strong> {selectedApplicant.job}</p>
          <p>Review the applicant’s contact details and recruitment status.</p>
          <button className="employer-applicant-secondary-action" onClick={() => setMessage("CV details are not available for this applicant yet.")} type="button">
            View CV
          </button>
          {message && <p className="employer-applicant-feedback" role="status">{message}</p>}
        </section>

        <section className="employer-applicant-detail-panel" aria-labelledby="recruitment-decision-title">
          <h2 id="recruitment-decision-title">Recruitment decision</h2>
          <label className="employer-applicant-status-field" htmlFor="application-status">
            <span>Application status</span>
            <select id="application-status" onChange={(event) => setNextStatus(event.target.value as AppStatus)} value={selectedStatus}>
              {APP_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <div className="employer-applicant-actions">
            <button className="employer-applicant-save-action" onClick={handleSaveStatus} type="button">Save status</button>
            <button className="employer-applicant-shortlist-action" onClick={() => saveStatus("Shortlisted")} type="button">Shortlist candidate</button>
            <button className="employer-applicant-reject-action" onClick={() => setShowRejectDialog(true)} type="button">Reject candidate</button>
          </div>
        </section>
      </div>

      {showRejectDialog && (
        <ReasonDialog
          category="applicant"
          onClose={() => setShowRejectDialog(false)}
          onConfirm={(reason, note) => saveStatus("Rejected", reason, note)}
          subject={selectedApplicant.name}
        />
      )}
    </>
  );
}
