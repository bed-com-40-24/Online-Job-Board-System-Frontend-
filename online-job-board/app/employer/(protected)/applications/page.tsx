'use client';

import { useMemo, useState } from 'react';
import Badge from '@/components/Badge';
import ReasonDialog from '@/components/ReasonDialog';
import Shell from '@/components/Shell';
import { APP_STATUSES, type AppStatus, type Applicant } from '@/lib/data';
import { useStore } from '@/lib/store';

type NoticeMessage = { kind: 'success' | 'error'; text: string };

export default function ApplicationsPage() {
  const { myApplicants, setApplicantStatus, ready } = useStore();
  const [filter, setFilter] = useState<AppStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [rejectionApplicant, setRejectionApplicant] = useState<Applicant | null>(null);
  const [notice, setNotice] = useState<NoticeMessage | null>(null);

  const counts = useMemo(
    () => ({
      All: myApplicants.length,
      Pending: myApplicants.filter((applicant) => applicant.status === 'Pending').length,
      Shortlisted: myApplicants.filter((applicant) => applicant.status === 'Shortlisted').length,
      Accepted: myApplicants.filter((applicant) => applicant.status === 'Accepted').length,
      Rejected: myApplicants.filter((applicant) => applicant.status === 'Rejected').length,
    }),
    [myApplicants],
  );
  const visibleApplicants = useMemo(() => {
    const query = search.trim().toLowerCase();
    return myApplicants.filter((applicant) => {
      const matchesStatus = filter === 'All' || applicant.status === filter;
      const matchesSearch =
        !query ||
        applicant.name.toLowerCase().includes(query) ||
        applicant.email.toLowerCase().includes(query) ||
        applicant.job.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [myApplicants, filter, search]);

  const changeStatus = (applicant: Applicant, status: AppStatus) => {
    if (status === applicant.status) return;
    setNotice(null);

    if (status === 'Rejected') {
      setRejectionApplicant(applicant);
      return;
    }

    try {
      const saved = setApplicantStatus(applicant.id, status);
      setNotice(
        saved
          ? { kind: 'success', text: `${applicant.name} is now ${status}.` }
          : { kind: 'error', text: 'The application status could not be updated.' },
      );
    } catch {
      setNotice({ kind: 'error', text: 'Something went wrong while updating this application.' });
    }
  };

  if (!ready) {
    return (
      <Shell>
        <div className="content" aria-busy="true">
          <h1>Loading applications...</h1>
          <p className="muted">Please wait.</p>
        </div>
      </Shell>  );
  }

  return (
    <Shell>
      <div className="content applications-page">
        <header className="page-head applications-page-heading">
          <p className="eyebrow">Employer workspace</p>
          <h1>Applications</h1>
          <p className="muted">
            Review candidates for your vacancies and manage their application status.
          </p>
          <p className="notice" role="note">
            This workflow uses sample applicants. Status changes are not saved to Oracle.
          </p>
        </header>

        {notice && (
          <div className={`notice ${notice.kind}`} role="status">
            {notice.text}
            <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notice">
              ×
            </button>
          </div>
        )}

        <section
          aria-label="Filter applications by status"
          className="stats applications-status-filters"
        >
          {(['All', ...APP_STATUSES] as const).map((status) => (
            <button
              aria-pressed={filter === status}
              className={`card stat-card${filter === status ? ' selected' : ''}`}
              key={status}
              onClick={() => setFilter(status)}
              type="button"
            >
              <span className="stat-label">{status}</span>
              <span className="number">{counts[status]}</span>
              <span className="small muted">applications</span>
            </button>
          ))}
        </section>

        <section
          aria-labelledby="applications-list-heading"
          className="panel applications-panel"
        >
          <div className="applications-panel-heading">
            <div>
              <h2 id="applications-list-heading">
                {filter === 'All' ? 'All applications' : `${filter} applications`}
              </h2>
              <p aria-live="polite">
                Showing {visibleApplicants.length} of {myApplicants.length} applications
              </p>
            </div>
            <label className="field">
              <span>Search applicants</span>
              <input
                type="search"
                placeholder="Search name, email or vacancy..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>
          <div
            aria-label="Application records"
            className="tablewrap applications-table-wrap"
            role="region"
            tabIndex={0}
          >
            <table className="applications-table">
              <thead>
                <tr>
                  <th scope="col">Applicant</th>
                  <th scope="col">Vacancy</th>
                  <th scope="col">Date applied</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleApplicants.map((applicant) => (
                  <tr key={applicant.id}>
                    <td>
                      <strong>{applicant.name}</strong>
                      <br />
                      <span className="muted">{applicant.email}</span>
                    </td>
                    <td>{applicant.job}</td>
                    <td>{applicant.applied}</td>
                    <td>
                      <Badge status={applicant.status} />
                      {applicant.reason && (
                        <p className="reason-text">
                          {applicant.reason}
                          {applicant.note ? ` — ${applicant.note}` : ''}
                        </p>
                      )}
                    </td>
                    <td>
                      <div className="application-actions">
                        <button
                          type="button"
                          className="confirm-cancel"
                          onClick={() => setSelectedApplicant(applicant)}
                        >
                          View details
                        </button>
                        {applicant.status === 'Pending' && (
                          <button
                            type="button"
                            className="primary"
                            onClick={() => changeStatus(applicant, 'Shortlisted')}
                          >
                            Shortlist
                          </button>
                        )}
                        {applicant.status === 'Shortlisted' && (
                          <button
                            type="button"
                            className="primary"
                            onClick={() => changeStatus(applicant, 'Accepted')}
                          >
                            Accept
                          </button>
                        )}
                        {applicant.status !== 'Rejected' && applicant.status !== 'Accepted' && (
                          <button
                            type="button"
                            className="danger"
                            onClick={() => changeStatus(applicant, 'Rejected')}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleApplicants.length === 0 && (
                  <tr>
                    <td className="muted applications-empty-row" colSpan={5}>
                      <div className="empty-state">
                        <h3>No applications found</h3>
                        <p>Try another search term or select a different status.</p>
                        <button
                          type="button"
                          className="confirm-cancel"
                          onClick={() => {
                            setSearch('');
                            setFilter('All');
                          }}
                        >
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {selectedApplicant && (
          <div
            className="confirm-overlay"
            role="presentation"
            onClick={() => setSelectedApplicant(null)}
          >
            <section
              className="confirm-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="applicant-details-title"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 id="applicant-details-title">Applicant details</h2>
              <div className="applicant-details">
                <p><strong>Name:</strong> {selectedApplicant.name}</p>
                <p><strong>Email:</strong> {selectedApplicant.email}</p>
                <p><strong>Vacancy:</strong> {selectedApplicant.job}</p>
                <p><strong>Vacancy ID:</strong> {selectedApplicant.jobId}</p>
                <p><strong>Date applied:</strong> {selectedApplicant.applied}</p>
                <p>
                  <strong>Application status:</strong>{' '}
                  <Badge status={selectedApplicant.status} />
                </p>
                {selectedApplicant.reason && (
                  <p><strong>Rejection reason:</strong> {selectedApplicant.reason}</p>
                )}
                {selectedApplicant.note && (
                  <p><strong>Additional note:</strong> {selectedApplicant.note}</p>
                )}
              </div>
              <div className="confirm-actions">
                <button
                  type="button"
                  className="confirm-cancel"
                  onClick={() => setSelectedApplicant(null)}
                >
                  Close
                </button>
              </div>
            </section>
          </div>
        )}

        {rejectionApplicant && (
          <ReasonDialog
            category="applicant"
            onClose={() => setRejectionApplicant(null)}
            onConfirm={(reason, note) => {
              try {
                const saved = setApplicantStatus(
                  rejectionApplicant.id,
                  'Rejected',
                  reason,
                  note,
                );
                setNotice(
                  saved
                    ? { kind: 'success', text: `${rejectionApplicant.name} was rejected.` }
                    : { kind: 'error', text: 'The rejection could not be saved.' },
                );
                return saved;
              } catch {
                setNotice({ kind: 'error', text: 'An error occurred while rejecting the applicant.' });
                return false;
              }
            }}
            subject={rejectionApplicant.name}
          />
        )}
      </div>
    </Shell>
  );
}
