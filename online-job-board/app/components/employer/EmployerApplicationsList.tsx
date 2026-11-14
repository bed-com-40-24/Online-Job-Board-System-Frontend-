"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import HistoryNavigation from "@/app/components/shared/HistoryNavigation";
import { APP_STATUSES } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function EmployerApplicationsList() {
  const { myApplicants } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const visibleApplicants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return myApplicants
      .filter((applicant) => !status || applicant.status === status)
      .filter((applicant) =>
        !normalizedQuery ||
        [applicant.name, applicant.email, applicant.job].some((value) => value.toLowerCase().includes(normalizedQuery)),
      );
  }, [myApplicants, query, status]);

  return (
    <>
      <div className="employer-applications-heading">
        <div className="employer-page-heading">
          <HistoryNavigation fallbackHref="/employer/dashboard" />
          <div>
            <p className="employer-dashboard-kicker">EMPLOYER WORKSPACE</p>
            <h1>Applications</h1>
            <p>Review candidates connected to your own vacancies.</p>
          </div>
        </div>
      </div>

      <section className="employer-applications-panel" aria-label="Applications">
        <div className="employer-applications-toolbar">
          <label className="employer-vacancies-search employer-applications-search">
            <Search aria-hidden="true" size={17} />
            <span className="sr-only">Search applications</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by candidate name, email address or vacancy"
              type="search"
              value={query}
            />
          </label>
          <label className="employer-vacancies-status-filter">
            <span className="sr-only">Filter applications by status</span>
            <select onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="">All statuses</option>
              {APP_STATUSES.map((candidateStatus) => (
                <option key={candidateStatus} value={candidateStatus}>{candidateStatus}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="employer-vacancies-table-wrap employer-applications-table-wrap" role="region" aria-label="Application records" tabIndex={0}>
          <table className="employer-vacancies-table employer-applications-table">
            <thead>
              <tr>
                <th scope="col">Applicant</th>
                <th scope="col">Vacancy</th>
                <th scope="col">Applied</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleApplicants.map((applicant) => (
                <tr key={applicant.id}>
                  <td>
                    <strong>{applicant.name}</strong>
                    <div className="employer-vacancies-subtext">{applicant.email}</div>
                  </td>
                  <td>{applicant.job}</td>
                  <td>{applicant.applied}</td>
                  <td><StatusBadge value={applicant.status === "Pending" ? "New" : applicant.status} /></td>
                  <td>
                    <Link className="employer-vacancies-view" href={`/employer/applications/${encodeURIComponent(applicant.id)}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {visibleApplicants.length === 0 && (
                <tr>
                  <td className="employer-vacancies-empty" colSpan={5}>
                    No applications match your search or selected status.
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
