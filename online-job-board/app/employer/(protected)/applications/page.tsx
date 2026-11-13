'use client';

import { useState } from 'react';
import Badge from '@/components/Badge';
import ReasonDialog from '@/components/ReasonDialog';
import Shell from '@/components/Shell';
import { APP_STATUSES, type AppStatus } from '@/lib/data';
import { useStore } from '@/lib/store';

type NoticeMessage = { kind: 'success' | 'error'; text: string };

export default function ApplicationsPage() {
  const { myApplicants, setApplicantStatus } = useStore();
  const [filter, setFilter] = useState<AppStatus | null>(null);
  const [rejectionId, setRejectionId] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeMessage | null>(null);

  const counts = APP_STATUSES.map((status) => ({
    status,
    count: myApplicants.filter((applicant) => applicant.status === status).length,
  }));
  const visibleApplicants = filter
    ? myApplicants.filter((applicant) => applicant.status === filter)
    : myApplicants;
  const rejectionApplicant = myApplicants.find((applicant) => applicant.id === rejectionId);

  const changeStatus = (id: string, value: string) => {
    const status = APP_STATUSES.find((candidate) => candidate === value);
    const applicant = myApplicants.find((candidate) => candidate.id === id);
    if (!status || !applicant || status === applicant.status) return;
    setNotice(null);

    if (status === 'Rejected') {
      setRejectionId(id);
      return;
    }

    if (setApplicantStatus(id, status)) {
      setNotice({ kind: 'success', text: `${applicant.name} is now ${status}.` });
    } else {
      setNotice({ kind: 'error', text: 'The application status could not be updated.' });
    }
  };

  const closeDialog = () => setRejectionId(null);

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
          </div>
        )}

        <section
          aria-label="Filter applications by status"
          className="stats applications-status-filters"
        >
          {counts.map(({ status, count }) => (
            <button
              aria-pressed={filter === status}
              className={`card stat-card${filter === status ? ' selected' : ''}`}
              key={status}
              onClick={() => setFilter((current) => (current === status ? null : status))}
              type="button"
            >
              <span className="stat-label">{status}</span>
              <span className="number">{count}</span>
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
                {filter ? `${filter} applications` : 'All applications'}
              </h2>
              <p aria-live="polite">
                Showing {visibleApplicants.length} of {myApplicants.length} applications
              </p>
            </div>
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
                  <th scope="col">Status</th>
                  <th scope="col">Change status</th>
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
                      <label className="visually-hidden" htmlFor={`status-${applicant.id}`}>
                        Change status for {applicant.name}
                      </label>
                      <select
                        id={`status-${applicant.id}`}
                        onChange={(event) => changeStatus(applicant.id, event.target.value)}
                        value={applicant.status}
                      >
                        {APP_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {visibleApplicants.length === 0 && (
                  <tr>
                    <td className="muted applications-empty-row" colSpan={4}>
                      No applications match this status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {rejectionApplicant && (
          <ReasonDialog
            category="applicant"
            onClose={closeDialog}
            onConfirm={(reason, note) => {
              const saved = setApplicantStatus(rejectionApplicant.id, 'Rejected', reason, note);
              if (saved) {
                setNotice({ kind: 'success', text: `${rejectionApplicant.name} was rejected.` });
              }
              return saved;
            }}
            subject={rejectionApplicant.name}
          />
        )}
      </div>
    </Shell>
  );
}
