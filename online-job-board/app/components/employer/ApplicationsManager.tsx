'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import Badge from '@/app/components/shared/Badge';
import ReasonDialog from '@/app/components/shared/ReasonDialog';
import HistoryNavigation from '@/app/components/shared/HistoryNavigation';
import { APP_STATUSES, formatVacancyId, type AppStatus, type Applicant } from '@/lib/data';
import { useStore } from '@/lib/store';
import { updateEmployerApplicationStatus } from '@/app/actions/employer-workspace';
import { useRouter } from 'next/navigation';

type NoticeMessage = { kind: 'success' | 'error'; text: string };

export default function ApplicationsPage({ jobId }: { jobId?: string }) {
  const { myApplicants, setApplicantStatus, ready, backendMode } = useStore();
  const router = useRouter();
  const [filter, setFilter] = useState<AppStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [rejectionApplicant, setRejectionApplicant] = useState<Applicant | null>(null);
  const [notice, setNotice] = useState<NoticeMessage | null>(null);
  const [isSaving, startTransition] = useTransition();

  const scopedApplicants = useMemo(
    () => jobId ? myApplicants.filter((applicant) => applicant.jobId === jobId) : myApplicants,
    [jobId, myApplicants],
  );
  const scopedJobTitle = scopedApplicants[0]?.job;
  const counts = useMemo(
    () => ({
      All: scopedApplicants.length,
      New: scopedApplicants.filter((applicant) => applicant.status === 'New').length,
      'In review': scopedApplicants.filter((applicant) => applicant.status === 'In review').length,
      Pending: scopedApplicants.filter((applicant) => applicant.status === 'Pending').length,
      Shortlisted: scopedApplicants.filter((applicant) => applicant.status === 'Shortlisted').length,
      Accepted: scopedApplicants.filter((applicant) => applicant.status === 'Accepted').length,
      Rejected: scopedApplicants.filter((applicant) => applicant.status === 'Rejected').length,
    }),
    [scopedApplicants],
  );
  const visibleApplicants = useMemo(() => {
    const query = search.trim().toLowerCase();
    return scopedApplicants.filter((applicant) => {
      const matchesStatus = filter === 'All' || applicant.status === filter;
      const matchesSearch =
        !query ||
        applicant.name.toLowerCase().includes(query) ||
        applicant.email.toLowerCase().includes(query) ||
        applicant.job.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [scopedApplicants, filter, search]);

  const changeStatus = (applicant: Applicant, status: AppStatus) => {
    if (status === applicant.status) return;
    setNotice(null);

    if (status === 'Rejected' && !backendMode) {
      setRejectionApplicant(applicant);
      return;
    }

    if (backendMode) {
      if (applicant.status !== 'New' || (status !== 'Shortlisted' && status !== 'Rejected')) return;
      startTransition(async () => {
        const formData = new FormData();
        formData.set('applicationId', applicant.id);
        formData.set('status', status === 'Shortlisted' ? 'SHORTLISTED' : 'REJECTED');
        const result = await updateEmployerApplicationStatus({}, formData);
        setNotice(result.success
          ? { kind: 'success', text: `${applicant.name} was ${status.toLowerCase()}.` }
          : { kind: 'error', text: result.error ?? 'The application status could not be updated.' });
        if (result.success) router.refresh();
      });
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
      <div className="employer-applications-page-content" aria-busy="true">
        <div className="employer-page-heading">
          <div>
            <p className="employer-dashboard-kicker">EMPLOYER WORKSPACE</p>
            <h1>Loading applications…</h1>
            <p>Please wait while your applications are loaded.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="employer-applications-page-content">
        <header className="employer-vacancies-heading">
          <div className="employer-page-heading">
            <HistoryNavigation fallbackHref="/employer/dashboard" />
            <div>
              <p className="employer-dashboard-kicker">EMPLOYER WORKSPACE</p>
              <h1>{jobId ? "Vacancy applicants" : "Applications"}</h1>
              <p className="employer-module-description">
                {jobId && scopedJobTitle
                  ? `Review applicants for ${scopedJobTitle}.`
                  : "Review candidates for your vacancies and manage their application status."}
              </p>
              {jobId && (
                <div className="employer-applications-heading-links">
                  <Link className="employer-vacancies-view" href="/employer/applications">
                    View all applications
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {notice && (
          <div className={`employer-applications-notice employer-applications-notice-${notice.kind}`} role="status">
            {notice.text}
            <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notice">
              ×
            </button>
          </div>
        )}

        <section
          aria-label="Filter applications by status"
          className="employer-applications-status-filters"
        >
          {(['All', ...APP_STATUSES] as const).map((status) => (
            <button
              aria-pressed={filter === status}
              className={`employer-applications-status-filter${filter === status ? ' selected' : ''}`}
              key={status}
              onClick={() => setFilter(status)}
              type="button"
            >
              <span>{status}</span>
              <strong>{counts[status]}</strong>
              <small>applications</small>
            </button>
          ))}
        </section>

        <section
          aria-labelledby="applications-list-heading"
          className="employer-vacancies-panel employer-applications-panel"
        >
          <div className="employer-applications-panel-heading">
            <div>
              <h2 id="applications-list-heading">
                {filter === 'All' ? 'All applications' : `${filter} applications`}
              </h2>
              <p aria-live="polite">
                Showing {visibleApplicants.length} of {scopedApplicants.length} applications
              </p>
            </div>
            <label className="employer-vacancies-search employer-applications-search">
              <span className="sr-only">Search applicants</span>
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
            className="employer-vacancies-table-wrap employer-applications-table-wrap"
            role="region"
            tabIndex={0}
          >
            <table className="employer-vacancies-table employer-applications-table">
              <thead>
                <tr>
                  <th scope="col">Applicant</th>
                  <th scope="col">Vacancy</th>
                  <th scope="col">Applied</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
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
                          className="employer-vacancies-view employer-applications-action"
                          onClick={() => setSelectedApplicant(applicant)}
                        >
                          View details
                        </button>
                        {(applicant.status === 'Pending' || (backendMode && applicant.status === 'New')) && (
                          <button
                            disabled={isSaving}
                            type="button"
                            className="employer-application-shortlist"
                            onClick={() => changeStatus(applicant, 'Shortlisted')}
                          >
                            Shortlist
                          </button>
                        )}
                        {applicant.status === 'Shortlisted' && !backendMode && (
                          <button
                            type="button"
                            className="employer-application-shortlist"
                            onClick={() => changeStatus(applicant, 'Accepted')}
                          >
                            Accept
                          </button>
                        )}
                        {!backendMode && applicant.status !== 'Rejected' && applicant.status !== 'Accepted' && (
                          <button
                            type="button"
                            className="employer-application-reject"
                            onClick={() => changeStatus(applicant, 'Rejected')}
                          >
                            Reject
                          </button>
                        )}
                        {backendMode && applicant.status === 'New' && (
                          <button
                            className="employer-application-reject"
                            disabled={isSaving}
                            onClick={() => changeStatus(applicant, 'Rejected')}
                            type="button"
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
                    <td className="employer-vacancies-empty" colSpan={5}>
                      <div className="empty-state">
                        <h3>No applications found</h3>
                        <p>Try another search term or select a different status.</p>
                        <button
                          type="button"
                          className="employer-vacancies-view"
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
                <p><strong>Vacancy ID:</strong> {formatVacancyId(selectedApplicant.jobId)}</p>
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
  );
}
