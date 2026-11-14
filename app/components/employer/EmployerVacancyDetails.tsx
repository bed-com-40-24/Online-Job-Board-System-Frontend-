"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
import { EMP_ID } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function EmployerVacancyDetails({ jobId }: { jobId: string }) {
  const router = useRouter();
  const { jobs, myApplicants, setEmployerJobStatus, deleteEmployerJob } = useStore();
  const [notice, setNotice] = useState("");
  const job = jobs.find((entry) => entry.id === jobId && entry.owner === EMP_ID);

  if (!job) {
    return (
      <section className="employer-vacancy-not-found">
        <div className="employer-page-heading">
          <HistoryNavigation fallbackHref="/employer/vacancies" />
          <div>
            <p className="employer-dashboard-kicker">VACANCY DETAILS</p>
            <h1>Vacancy not found</h1>
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
            <p>{job.id} | {job.dept || "Other"} | {job.loc}</p>
          </div>
          {notice && <p className="notice" role="status">{notice}</p>}
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
          <p>Job ID: <strong>{job.id}</strong></p>
          <p>Applicants: <strong>{applicantCount}</strong></p>
          <div className="employer-vacancy-detail-actions">
            {job.status === "Closed" ? (
            <>
              <p role="status">This vacancy is closed. You can permanently delete it if you no longer need it.</p>
              <button className="employer-vacancy-delete-action" onClick={removeVacancy} type="button">
                Delete vacancy
              </button>
            </>
          ) : (
              <>
                <Link className="employer-vacancy-edit-action" href={`/employer/vacancies/new?id=${encodeURIComponent(job.id)}`}>
                  Edit vacancy
                </Link>
                <button
                  className="employer-vacancy-submit-action"
                  disabled={job.status !== "Draft"}
                  onClick={() => changeStatus("In review")}
                  type="button"
                >
                  {job.status === "Draft" ? "Submit for review" : "Already submitted"}
                </button>
                <button className="employer-vacancy-close-action" onClick={() => changeStatus("Closed")} type="button">
                  Close vacancy
                </button>
                <button className="employer-vacancy-delete-action" onClick={removeVacancy} type="button">
                  Delete vacancy
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
