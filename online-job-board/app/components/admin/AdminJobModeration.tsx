"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { type JobStatus } from "@/lib/data";
import { useStore } from "@/lib/store";

const moderationStatuses: JobStatus[] = ["In review", "Published", "Draft", "Closed", "Rejected"];

export default function AdminJobModeration() {
  const { employers, jobs, myApplicants } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const visibleJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return jobs
      .filter((job) => !status || job.status === status)
      .filter((job) => {
        const employer = employers.find((entry) => entry.id === job.owner);
        return !normalizedQuery || [job.title, job.id, job.dept ?? "", job.loc, employer?.name ?? ""]
          .some((value) => value.toLowerCase().includes(normalizedQuery));
      });
  }, [employers, jobs, query, status]);

  return (
    <section aria-label="Job moderation" className="admin-panel admin-job-moderation-list-panel">
      <div className="admin-job-moderation-toolbar">
        <label className="admin-job-moderation-search">
          <Search aria-hidden="true" size={16} />
          <span className="sr-only">Search vacancies</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by job title, vacancy ID, department or location"
            type="search"
            value={query}
          />
        </label>
        <label className="admin-job-moderation-filter">
          <span className="sr-only">Filter vacancies by status</span>
          <select onChange={(event) => setStatus(event.target.value)} value={status}>
            <option value="">All statuses</option>
            {moderationStatuses.map((jobStatus) => <option key={jobStatus} value={jobStatus}>{jobStatus}</option>)}
          </select>
        </label>
      </div>

      <div aria-label="Vacancy records" className="admin-table-wrap" role="region" tabIndex={0}>
        <table className="admin-employer-table admin-job-moderation-table">
          <thead>
            <tr>
              <th scope="col">Vacancy</th>
              <th scope="col">Employer</th>
              <th scope="col">Type / Location</th>
              <th scope="col">Applicants</th>
              <th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleJobs.map((job) => {
              const employer = employers.find((entry) => entry.id === job.owner);
              const applicantCount = myApplicants.filter((applicant) => applicant.jobId === job.id).length;
              return (
                <tr key={job.id}>
                  <td>
                    <strong>{job.title}</strong>
                    <span className="admin-job-moderation-subtext">{job.id}{job.dept ? ` · ${job.dept}` : ""}</span>
                  </td>
                  <td>{employer?.name ?? "Unknown employer"}</td>
                  <td>{job.type ?? "Full-time"}<span className="admin-job-moderation-subtext">{job.loc}</span></td>
                  <td>{applicantCount}</td>
                  <td><StatusBadge value={job.status} /></td>
                  <td>
                    <Link className="admin-job-moderation-view" href={`/admin/jobs/${encodeURIComponent(job.id)}`}>View</Link>
                  </td>
                </tr>
              );
            })}
            {visibleJobs.length === 0 && (
              <tr><td className="admin-job-moderation-empty" colSpan={6}>No vacancies match your search or selected status.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
