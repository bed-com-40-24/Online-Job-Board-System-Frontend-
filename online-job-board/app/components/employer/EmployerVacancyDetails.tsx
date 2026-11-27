"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
import { EMP_ID, type Job } from "@/lib/data";
import { useStore } from "@/lib/store";
import {
  closeEmployerJob as closeBackendJob,
  deleteEmployerJob as deleteBackendJob,
  type EmployerWorkspaceActionState,
} from "@/app/actions/employer-workspace";

export default function EmployerVacancyDetails({
  initialJob,
  initialJobError,
  jobId,
}: {
  initialJob: Job | null;
  initialJobError?: string;
  jobId: string;
}) {
  const router = useRouter();
  const { jobs, myApplicants, setEmployerJobStatus, deleteEmployerJob, backendMode } = useStore();
  const [notice, setNotice] = useState("");
  const [closeState, closeAction, closePending] = useActionState<EmployerWorkspaceActionState, FormData>(closeBackendJob, {});
  const [deleteState, deleteAction, deletePending] = useActionState<EmployerWorkspaceActionState, FormData>(deleteBackendJob, {});
  const job = initialJob
    ?? jobs.find((entry) => entry.id === jobId && (backendMode || entry.owner === EMP_ID));

  useEffect(() => {
    if (deleteState.success) router.push("/employer/vacancies");
  }, [deleteState.success, router]);

  if (!job) {
    return (
      <section className="employer-vacancy-not-found">
        <div className="employer-page-heading">
          <HistoryNavigation fallbackHref="/employer/vacancies" />
          <div>
            <p className="employer-dashboard-kicker">VACANCY DETAILS</p>
            <h1>{initialJobError ? "Unable to load vacancy" : "Vacancy not found"}</h1>
            {initialJobError && <p className="notice" role="alert">{initialJobError}</p>}
          </div>
        </div>
      </section>
    );
  }

  const selectedJob = job;
  const applicantCount = myApplicants.filter((applicant) => applicant.jobId === job.id).length;

  function changeStatus(status: "In review" | "Closed") {
    if (selectedJob.status === "Closed") return;
    const action = status === "Closed" ? "close" : "submit for administrator review";
    if (!window.confirm(`Are you sure you want to ${action} this vacancy?`)) return;
    if (!setEmployerJobStatus(selectedJob.id, status)) {
      setNotice(status === "Closed"
        ? "This vacancy has already been closed."
        : "This vacancy cannot be submitted again.");
    }
  }

  function removeVacancy() {
    if (!window.confirm("Are you sure you want to permanently delete this vacancy? This action cannot be undone.")) return;
    if (deleteEmployerJob(selectedJob.id)) router.push("/employer/vacancies");
  }

  return (
    <>
      <div className="employer-vacancy-detail-heading">
        <div className="employer-vacancy-detail-heading-main">
          <HistoryNavigation fallbackHref="/employer/vacancies" />
          <div>
            <p className="employer-dashboard-kicker">VACANCY DETAILS</p>
            <h1>{job.title}</h1>
            <p className="employer-vacancy-detail-meta">
              <span><small>Department</small><strong>{job.dept || "Other"}</strong></span>
              <span><small>Location</small><strong>{job.loc || "Not specified"}</strong></span>
            </p>
          </div>
          {notice && <p className="notice" role="status">{notice}</p>}
          {closeState.error && <p className="notice" role="alert">{closeState.error}</p>}
          {closeState.success && <p className="notice" role="status">{closeState.success}</p>}
          {deleteState.error && <p className="notice" role="alert">{deleteState.error}</p>}
        </div>
      </div>

      <div className="employer-vacancy-detail-grid">
        <section className="employer-vacancy-detail-panel" aria-labelledby="vacancy-overview-title">
          <h2 id="vacancy-overview-title">Job overview</h2>
          <StatusBadge value={job.status} />
          <p>{job.description || "No description provided."}</p>
          <h3>Requirements</h3>
          <p>{job.requirements || "No requirements provided."}</p>
          <p className="employer-vacancy-deadline">Deadline: {job.deadline || "Not specified"}</p>
        </section>

        <section className="employer-vacancy-detail-panel" aria-labelledby="vacancy-posting-title">
          <h2 id="vacancy-posting-title">Posting information</h2>
          <p>
            Applicants:{" "}
            <Link
              className="employer-vacancies-view"
              href={`/employer/applications?jobId=${encodeURIComponent(job.id)}`}
            >
              View applicants ({applicantCount})
            </Link>
          </p>
          <div className="employer-vacancy-detail-actions">
            {job.status === "Closed" ? (
            <>
              <p role="status">This vacancy is closed. You can permanently delete it if you no longer need it.</p>
              {backendMode ? (
                <form action={deleteAction}>
                  <input name="jobId" type="hidden" value={job.id} />
                  <button className="employer-vacancy-delete-action" disabled={deletePending} type="submit">Delete vacancy</button>
                </form>
              ) : <button className="employer-vacancy-delete-action" onClick={removeVacancy} type="button">Delete vacancy</button>}
            </>
          ) : (
              <>
                <Link className="employer-vacancy-edit-action" href={`/employer/vacancies/new?id=${encodeURIComponent(job.id)}`}>
                  Edit vacancy
                </Link>
                {!backendMode && <button
                  className="employer-vacancy-submit-action"
                  disabled={job.status !== "Draft"}
                  onClick={() => changeStatus("In review")}
                  type="button"
                >
                  {job.status === "Draft" ? "Submit for review" : "Already submitted"}
                </button>}
                {backendMode ? (
                  <form action={closeAction}>
                    <input name="jobId" type="hidden" value={job.id} />
                    <button className="employer-vacancy-close-action" disabled={closePending} type="submit">Close vacancy</button>
                  </form>
                ) : <button className="employer-vacancy-close-action" onClick={() => changeStatus("Closed")} type="button">Close vacancy</button>}
                {backendMode ? (
                  <form action={deleteAction}>
                    <input name="jobId" type="hidden" value={job.id} />
                    <button className="employer-vacancy-delete-action" disabled={deletePending} type="submit">Delete vacancy</button>
                  </form>
                ) : <button className="employer-vacancy-delete-action" onClick={removeVacancy} type="button">Delete vacancy</button>}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
