'use client';

import { useMemo, useState } from 'react';
import Badge from '@/components/Badge';
import ReasonDialog from '@/components/ReasonDialog';
import { APP_STATUSES, type AppStatus, type Applicant } from '@/lib/data';
import { useStore } from '@/lib/store';

type Notice = {
  kind: 'success' | 'error';
  text: string;
};

export default function ApplicationsPage() {
  const { myApplicants, setApplicantStatus, ready } = useStore();

  const [filter, setFilter] = useState<AppStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [rejectionApplicant, setRejectionApplicant] = useState<Applicant | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const counts = useMemo(
    () => ({
      All: myApplicants.length,
      Pending: myApplicants.filter((a) => a.status === 'Pending').length,
      Shortlisted: myApplicants.filter((a) => a.status === 'Shortlisted').length,
      Accepted: myApplicants.filter((a) => a.status === 'Accepted').length,
      Rejected: myApplicants.filter((a) => a.status === 'Rejected').length,
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

  function updateStatus(applicant: Applicant, status: AppStatus) {
    if (status === 'Rejected') {
      setRejectionApplicant(applicant);
      return;
    }

    try {
      const saved = setApplicantStatus(applicant.id, status);

      setNotice(
        saved
          ? { kind: 'success', text: `${applicant.name} is now ${status}.` }
          : { kind: 'error', text: 'The status could not be updated. Check your permissions and try again.' },
      );
    } catch {
      setNotice({ kind: 'error', text: 'Something went wrong while updating this application.' });
    }
  }

  if (!ready) {
    return (
      <main className="content" aria-busy="true">
        <h1>Loading applications...</h1>
        <p className="muted">Please wait.</p>
      </main>
    );
  }

  return (
    <main className="content">
      <header className="page-head">
        <p className="eyebrow">Employer workspace</p>
        <h1>Applications</h1>
        <p className="muted">
          Review applicants, view their details and manage your hiring decisions.
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

      <section className="stats" aria-label="Application statistics">
        {(['All', ...APP_STATUSES] as const).map((status) => (
          <button
            key={status}
            type="button"
            className={`card stat-card${filter === status ? ' selected' : ''}`}
            aria-pressed={filter === status}
            onClick={() => setFilter(status)}
          >
            <span className="stat-label">{status} applications</span>
            <span className="number">{counts[status]}</span>
          </button>
        ))}
      </section>

      <section className="panel">
        <div className="page-head">
          <h2>{filter === 'All' ? 'All applications' : `${filter} applications`}</h2>
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

        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Vacancy</th>
                <th>Date applied</th>
                <th>Status</th>
                <th>Actions</th>
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
                          onClick={() => updateStatus(applicant, 'Shortlisted')}
                        >
                          Shortlist
                        </button>
                      )}

                      {applicant.status === 'Shortlisted' && (
                        <button
                          type="button"
                          className="primary"
                          onClick={() => updateStatus(applicant, 'Accepted')}
                        >
                          Accept
                        </button>
                      )}

                      {applicant.status !== 'Rejected' && applicant.status !== 'Accepted' && (
                        <button
                          type="button"
                          className="danger"
                          onClick={() => updateStatus(applicant, 'Rejected')}
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
                  <td colSpan={5}>
                    <div className="empty-state">
                      <h3>No applications found</h3>
                      <p className="muted">
                        Try another search term or select a different status.
                      </p>
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
          subject={rejectionApplicant.name}
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
        />
      )}
    </main>
  );
}
