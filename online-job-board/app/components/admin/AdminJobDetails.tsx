"use client";

import Link from "next/link";
import { useState } from "react";
import Badge from "@/app/components/shared/Badge";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
import ReasonDialog from "@/app/components/shared/ReasonDialog";
import { isDeadlineOpen } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function AdminJobDetails({ jobId }: { jobId: string }) {
  const { employers, jobs, myApplicants, decideJob } = useStore();
  const job = jobs.find((entry) => entry.id === jobId);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [notice, setNotice] = useState("");

  if (!job) {
    return (
      <section className="admin-job-not-found">
        <p className="admin-eyebrow">VACANCY DETAILS</p>
        <h1>Vacancy not found</h1>
        <Link className="admin-job-moderation-view" href="/admin/jobs">Back to Job moderation</Link>
      </section>
    );
  }

  const selectedJob = job;
  const owner = employers.find((employer) => employer.id === selectedJob.owner);
  const applicantCount = myApplicants.filter((applicant) => applicant.jobId === selectedJob.id).length;
  const canApprove = selectedJob.status === "In review" && owner?.status === "Verified" && isDeadlineOpen(selectedJob.deadline);

  function approvePosting() {
    const published = decideJob(selectedJob.id, "Published", undefined, undefined, true);
    setNotice(published ? "Vacancy approved and published." : "This vacancy cannot be approved. Check employer verification and the deadline.");
  }

  return (
    <>
      <div className="admin-job-detail-page-heading">
        <div className="admin-job-detail-page-heading-main">
          <HistoryNavigation fallbackHref="/admin/jobs" />
          <div>
            <p className="admin-eyebrow">VACANCY DETAILS</p>
            <h1>{selectedJob.title}</h1>
            <p>{selectedJob.id} · {selectedJob.dept || "Other"} · {selectedJob.loc}</p>
          </div>
        </div>
      </div>

      {notice && <p className="admin-job-detail-notice" role="status">{notice}</p>}

      <div className="admin-job-detail-grid">
        <section aria-labelledby="admin-job-overview-title" className="admin-job-detail-card">
          <h2 id="admin-job-overview-title">Job overview</h2>
          <Badge status={selectedJob.status} />
          <p>{selectedJob.description || "No description provided."}</p>
          <h3>Requirements</h3>
          <p>{selectedJob.requirements || "No requirements provided."}</p>
          <p className="admin-job-deadline">Deadline: {selectedJob.deadline || "Not specified"}</p>
        </section>

        <section aria-labelledby="admin-job-posting-title" className="admin-job-detail-card">
          <h2 id="admin-job-posting-title">Posting information</h2>
          <p>Job ID: <strong>{selectedJob.id}</strong></p>
          <p>Applicants: <strong>{applicantCount}</strong></p>
          {selectedJob.status === "In review" && (
            <div className="admin-job-detail-actions">
              <button className="admin-job-detail-approve" disabled={!canApprove} onClick={approvePosting} type="button">Approve posting</button>
              <button className="admin-job-detail-reject" onClick={() => setShowRejectDialog(true)} type="button">Reject posting</button>
            </div>
          )}
        </section>
      </div>

      {showRejectDialog && (
        <ReasonDialog
          category="job"
          onClose={() => setShowRejectDialog(false)}
          onConfirm={(reason, note) => {
            const rejected = decideJob(selectedJob.id, "Rejected", reason, note);
            if (rejected) setNotice("Vacancy rejected.");
            return rejected;
          }}
          subject={selectedJob.title}
        />
      )}
    </>
  );
}
