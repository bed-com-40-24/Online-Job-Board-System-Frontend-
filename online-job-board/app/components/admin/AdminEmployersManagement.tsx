"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "@/app/components/shared/Badge";
import type { Employer, OrgStatus } from "@/lib/data";
import { useStore } from "@/lib/store";

const employerStatuses: OrgStatus[] = ["Pending", "Verified", "Rejected"];

export default function AdminEmployersManagement() {
  const { employers, jobs } = useStore();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);

  const visibleEmployers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return employers.filter((employer) => {
      const matchesStatus = !statusFilter || employer.status === statusFilter;
      const matchesSearch = !search || [employer.name, employer.email, employer.industry]
        .some((value) => value.toLowerCase().includes(search));
      return matchesStatus && matchesSearch;
    });
  }, [employers, query, statusFilter]);

  return (
    <>
      <section aria-label="Employer directory" className="admin-panel admin-employer-management-panel">
        <div className="admin-employer-toolbar">
          <label className="admin-employer-search">
            <Search aria-hidden="true" size={16} />
            <span className="sr-only">Search employers</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by organisation name, business email or industry"
              type="search"
              value={query}
            />
          </label>
          <label className="admin-employer-filter">
            <span className="sr-only">Filter employers by status</span>
            <select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="">All statuses</option>
              {employerStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
        </div>

        <div aria-label="Employer records" className="admin-table-wrap" role="region" tabIndex={0}>
          <table className="admin-employer-table admin-employer-management-table">
            <thead>
              <tr>
                <th scope="col">Employer</th>
                <th scope="col">Industry</th>
                <th scope="col">Jobs</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleEmployers.map((employer) => {
                const jobCount = jobs.filter((job) => job.owner === employer.id).length;
                return (
                  <tr key={employer.id}>
                    <td>
                      <strong>{employer.name}</strong>
                      <span className="admin-employer-email">{employer.email}</span>
                    </td>
                    <td>{employer.industry}</td>
                    <td>{jobCount}</td>
                    <td><Badge status={employer.status} /></td>
                    <td>
                      <div className="admin-employer-row-actions">
                        <button className="admin-employer-view" onClick={() => setSelectedEmployer(employer)} type="button">View</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visibleEmployers.length === 0 && (
                <tr><td className="admin-employer-empty" colSpan={5}>No employers match your search or selected status.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedEmployer && (
        <div className="admin-employer-dialog-backdrop" onClick={() => setSelectedEmployer(null)} role="presentation">
          <section aria-labelledby="admin-employer-details-title" aria-modal="true" className="admin-employer-dialog" onClick={(event) => event.stopPropagation()} role="dialog">
            <div className="admin-panel-heading">
              <div><h2 id="admin-employer-details-title">Employer details</h2><p>{selectedEmployer.name}</p></div>
              <button aria-label="Close employer details" className="admin-employer-dialog-close" onClick={() => setSelectedEmployer(null)} type="button">×</button>
            </div>
            <dl className="admin-employer-details-list">
              <div><dt>Business email</dt><dd>{selectedEmployer.email}</dd></div>
              <div><dt>Industry</dt><dd>{selectedEmployer.industry}</dd></div>
              <div><dt>Contact person</dt><dd>{selectedEmployer.contact}</dd></div>
              <div><dt>Phone</dt><dd>{selectedEmployer.phone}</dd></div>
              <div><dt>Business address</dt><dd>{selectedEmployer.address}</dd></div>
              <div><dt>Registration number</dt><dd>{selectedEmployer.regNo}</dd></div>
              <div><dt>Account status</dt><dd><Badge status={selectedEmployer.status} /></dd></div>
            </dl>
          </section>
        </div>
      )}

    </>
  );
}
