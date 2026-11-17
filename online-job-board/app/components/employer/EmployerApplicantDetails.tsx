"use client";

import { useState, useTransition } from "react";
import ReasonDialog from "@/app/components/shared/ReasonDialog";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
import { APP_STATUSES, type AppStatus } from "@/lib/data";
import { useStore } from "@/lib/store";
import {
  getEmployerApplicantProfile,
  getEmployerCvDownloadUrl,
  updateEmployerApplicationStatus,
} from "@/app/actions/employer-workspace";
import { useRouter } from "next/navigation";

export default function EmployerApplicantDetails({ applicantId }: { applicantId: string }) {
  const { myApplicants, setApplicantStatus, backendMode } = useStore();
  const router = useRouter();
  const applicant = myApplicants.find((entry) => entry.id === applicantId);
  const [nextStatus, setNextStatus] = useState<AppStatus | "">("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState<{
    displayName?: string;
    fullName?: string;
    dateOfBirth?: string;
    phone?: string;
    location?: string;
    biography?: string;
  } | null>(null);
  const [isLoadingCv, startCvTransition] = useTransition();
  const [isSavingStatus, startStatusTransition] = useTransition();

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
  const canReview = currentStatus === "New";

  function saveStatus(status: AppStatus, reason?: string, note?: string) {
    if (backendMode) {
      if (!canReview || (status !== "Shortlisted" && status !== "Rejected")) {
        setMessage("The backend only allows pending applications to be shortlisted or rejected.");
        return false;
      }
      const formData = new FormData();
      formData.set("applicationId", selectedApplicant.id);
      formData.set("status", status === "Shortlisted" ? "SHORTLISTED" : "REJECTED");
      startStatusTransition(async () => {
        const result = await updateEmployerApplicationStatus({}, formData);
        setMessage(result.success ?? result.error ?? "The application status could not be updated.");
        if (result.success) {
          setNextStatus(status);
          router.refresh();
        }
      });
      return true;
    }
    const updated = setApplicantStatus(selectedApplicant.id, status, reason, note);
    setMessage(updated ? "Application status saved." : "The application status could not be updated.");
    if (updated) setNextStatus(status);
    return updated;
  }

  function openCv() {
    if (!backendMode) {
      setMessage("CV details are not available for this applicant yet.");
      return;
    }
    startCvTransition(async () => {
      try {
        const url = await getEmployerCvDownloadUrl(selectedApplicant.id);
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "The CV could not be opened.");
      }
    });
  }

  function loadProfile() {
    startCvTransition(async () => {
      try {
        setProfile(await getEmployerApplicantProfile(selectedApplicant.id));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "The applicant profile could not be loaded.");
      }
    });
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
          {backendMode && (
            <button className="employer-applicant-secondary-action" disabled={isLoadingCv} onClick={loadProfile} type="button">
              View applicant profile
            </button>
          )}
          <button className="employer-applicant-secondary-action" disabled={isLoadingCv} onClick={openCv} type="button">
            {isLoadingCv ? "Opening CV…" : "View CV"}
          </button>
          {profile && (
            <dl className="admin-employer-details-list">
              {profile.fullName && <div><dt>Full name</dt><dd>{profile.fullName}</dd></div>}
              {profile.dateOfBirth && <div><dt>Date of birth</dt><dd>{profile.dateOfBirth}</dd></div>}
              {profile.phone && <div><dt>Phone</dt><dd>{profile.phone}</dd></div>}
              {profile.location && <div><dt>Location</dt><dd>{profile.location}</dd></div>}
              {profile.biography && <div><dt>Biography</dt><dd>{profile.biography}</dd></div>}
            </dl>
          )}
          {message && <p className="employer-applicant-feedback" role="status">{message}</p>}
        </section>

        <section className="employer-applicant-detail-panel" aria-labelledby="recruitment-decision-title">
          <h2 id="recruitment-decision-title">Recruitment decision</h2>
          <label className="employer-applicant-status-field" htmlFor="application-status">
            <span>Application status</span>
            <select disabled={backendMode && !canReview} id="application-status" onChange={(event) => setNextStatus(event.target.value as AppStatus)} value={selectedStatus}>
              {(backendMode ? APP_STATUSES.filter((status) => status === "New" || status === "Shortlisted" || status === "Rejected") : APP_STATUSES).map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <div className="employer-applicant-actions">
            <button className="employer-applicant-save-action" disabled={backendMode && (!canReview || isSavingStatus)} onClick={handleSaveStatus} type="button">Save status</button>
            <button className="employer-applicant-shortlist-action" disabled={backendMode && (!canReview || isSavingStatus)} onClick={() => saveStatus("Shortlisted")} type="button">Shortlist candidate</button>
            <button className="employer-applicant-reject-action" disabled={backendMode && (!canReview || isSavingStatus)} onClick={() => setShowRejectDialog(true)} type="button">Reject candidate</button>
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
