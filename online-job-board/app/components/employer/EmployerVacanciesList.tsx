"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
import { EMP_ID, type JobStatus } from "@/lib/data";
import { useStore } from "@/lib/store";

const statuses: JobStatus[] = ["Published", "In review", "Draft", "Closed", "Rejected"];

export default function EmployerVacanciesList() {
  const { jobs, myApplicants } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const vacancies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return jobs
      .filter((job) => job.owner === EMP_ID)
      .filter((job) => !status || job.status === status)
      .filter((job) =>
        !normalizedQuery ||
        [job.title, job.id, job.dept, job.loc].some((value) => value?.toLowerCase().includes(normalizedQuery)),
      );
  }, [jobs, query, status]);

  return (
    <>
      <div className="employer-vacancies-heading">
        <div className="employer-page-heading">
          <HistoryNavigation fallbackHref="/employer/dashboard" />
          <div>
            <p className="employer-dashboard-kicker">EMPLOYER WORKSPACE</p>
            <h1>My vacancies</h1>
            <p>Only vacancies belonging to your account are shown.</p>
          </div>
        </div>
        <Link className="employer-dashboard-primary-action" href="/employer/vacancies/new">
          <Plus aria-hidden="true" size={16} /> Create vacancy
        </Link>
      </div>

      <section className="employer-vacancies-panel" aria-label="Your vacancies">
        <div className="employer-vacancies-toolbar">
          <label className="employer-vacancies-search">
            <Search aria-hidden="true" size={17} />
            <span className="sr-only">Search vacancies</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by job title, vacancy ID, department or location"
              type="search"
              value={query}
            />
          </label>
          <label className="employer-vacancies-status-filter">
            <span className="sr-only">Filter vacancies by status</span>
            <select onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="">All statuses</option>
              {statuses.map((vacancyStatus) => (
                <option key={vacancyStatus} value={vacancyStatus}>{vacancyStatus}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="employer-vacancies-table-wrap" role="region" aria-label="Vacancy records" tabIndex={0}>
          <table className="employer-vacancies-table">
            <thead>
              <tr>
                <th scope="col">Vacancy</th>
                <th scope="col">Type / location</th>
                <th scope="col">Applicants</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {vacancies.map((job) => (
                <tr key={job.id}>
                  <td>
                    <strong>{job.title}</strong>
                    <div className="employer-vacancies-subtext">{job.id} | {job.dept || "Other"}</div>
                  </td>
                  <td>
                    {job.type || "Not specified"}
                    <div className="employer-vacancies-subtext">{job.loc}</div>
                  </td>
                  <td>{myApplicants.filter((applicant) => applicant.jobId === job.id).length}</td>
                  <td><StatusBadge value={job.status} /></td>
                  <td>
                    <Link className="employer-vacancies-view" href={`/employer/vacancies/${encodeURIComponent(job.id)}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {vacancies.length === 0 && (
                <tr>
                  <td className="employer-vacancies-empty" colSpan={5}>
                    No vacancies match your search or selected status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </>
  );
}
