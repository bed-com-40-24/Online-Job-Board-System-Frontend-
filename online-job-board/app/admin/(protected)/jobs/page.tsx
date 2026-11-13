'use client';

import { useState } from 'react';
import Badge from '@/components/Badge';
import ReasonDialog from '@/components/ReasonDialog';
import Shell from '@/components/Shell';
import { isDeadlineOpen } from '@/lib/data';
import { useStore } from '@/lib/store';

// All of these checks must be complete before a job can be approved.
const moderatorChecks = [
  'The posting contains complete information',
  'The role and requirements are clear and relevant',
  'The content is appropriate and non-discriminatory',
];

// Holds the text and type of the message shown after an action.
type NoticeMessage = { kind: 'success' | 'error'; text: string };

// Admin page for reviewing submitted job postings.
export default function JobReviewPage() {
  const { employers, jobs, decideJob } = useStore();
  // Drafts are still being edited, so admins only see submitted jobs.
  const submittedJobs = jobs.filter((job) => job.status !== 'Draft');

  // Keep track of the selected job and each job's checklist answers.
  const [selectedId, setSelectedId] = useState('JB-1049');
  const [checksByJob, setChecksByJob] = useState<Record<string, boolean[]>>({});
  // The rejection ID controls which job's reason dialog is open.
  const [rejectionId, setRejectionId] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeMessage | null>(null);

  // Find the selected job and the employer who posted it.
  const selectedJob = submittedJobs.find((job) => job.id === selectedId);
  const owner = selectedJob ? employers.find((employer) => employer.id === selectedJob.owner) : undefined;

  // Use this job's saved answers, or start with every item unticked.
  const checks = selectedJob
    ? (checksByJob[selectedJob.id] ?? moderatorChecks.map(() => false))
    : [];
  const allChecksComplete = checks.length === moderatorChecks.length && checks.every(Boolean);
  const deadlineOpen = selectedJob ? isDeadlineOpen(selectedJob.deadline) : false;

  // Approval needs an in-review job, a verified employer, an open deadline, and a complete checklist.
  const canApprove =
    selectedJob?.status === 'In review' &&
    owner?.status === 'Verified' &&
    deadlineOpen &&
    allChecksComplete;
  const rejectingJob = submittedJobs.find((job) => job.id === rejectionId);

  // Update one checklist answer without changing the existing state directly.
  const updateCheck = (index: number, checked: boolean) => {
    if (!selectedJob) return;
    setChecksByJob((current) => {
      // Keep the answers separate for each job.
      const nextChecks = [...(current[selectedJob.id] ?? moderatorChecks.map(() => false))];
      nextChecks[index] = checked;
      return { ...current, [selectedJob.id]: nextChecks };
    });
  };

  // Publish the job only if it still meets the approval rules.
  const approve = () => {
    if (!selectedJob || !canApprove) return;
    const saved = decideJob(selectedJob.id, 'Published', undefined, undefined, allChecksComplete);
    setNotice(
      saved
        ? { kind: 'success', text: `${selectedJob.title} was approved and published.` }
        : { kind: 'error', text: 'The posting could not be approved. Check employer status and deadline.' },
    );
  };

  return (
    <Shell>
    <div className="content">
      <header className="page-head">
        <p className="eyebrow">Admin workspace</p>
        <h1>Job posting review</h1>
        <p className="muted">Review submitted vacancies before they are published.</p>
        <p className="notice" role="note">
          This workflow uses sample records. Review decisions are not saved to Oracle.
        </p>
      </header>

      {/* Screen readers announce this message after an action. */}
      {notice && (
        <div className={`notice ${notice.kind}`} role="status">
          {notice.text}
        </div>
      )}

      <div className="split">
        {/* The left side lists jobs that are ready for review. */}
        <section aria-label="Submitted jobs" className="panel">
          <h2>Submitted jobs</h2>
          {submittedJobs.map((job) => {
            const jobEmployer = employers.find((employer) => employer.id === job.owner);
            return (
              <button
                aria-pressed={selectedJob?.id === job.id}
                className={`item${selectedJob?.id === job.id ? ' sel' : ''}`}
                key={job.id}
                onClick={() => {
                  setSelectedId(job.id);
                  setNotice(null); // Clear the old message when another job is selected.
                }}
                type="button"
              >
                <strong>{job.title}</strong>
                <br />
                <span className="muted">{jobEmployer?.name ?? 'Unknown employer'}</span>
                <br />
                <Badge status={job.status} />
              </button>
            );
          })}
          {submittedJobs.length === 0 && <p className="muted">No submitted jobs to review.</p>}
        </section>

        {/* The right side shows details for the selected job. */}
        {selectedJob ? (
          <section aria-live="polite" className="panel">
            <div className="detail-heading">
              <div>
                <p className="eyebrow">Job details · {selectedJob.id}</p>
                <h2>{selectedJob.title}</h2>
              </div>
              <Badge status={selectedJob.status} />
            </div>
            <dl className="details-list">
              <div className="kv"><dt>Employer</dt><dd>{owner?.name ?? 'Unknown employer'}</dd></div>
              <div className="kv"><dt>Verification</dt><dd>{owner ? <Badge status={owner.status} /> : 'Unknown'}</dd></div>
              <div className="kv"><dt>Location</dt><dd>{selectedJob.loc}</dd></div>
              <div className="kv"><dt>Deadline</dt><dd>{selectedJob.deadline}</dd></div>
              <div className="kv"><dt>Description</dt><dd>{selectedJob.description}</dd></div>
              <div className="kv"><dt>Requirements</dt><dd>{selectedJob.requirements}</dd></div>
            </dl>

            {/* Show the decision controls only while the job is being reviewed. */}
            {selectedJob.status === 'In review' && (
              <>
                {/* Explain if verification or the deadline is blocking approval. */}
                {(!owner || owner.status !== 'Verified' || !deadlineOpen) && (
                  <div className="notice" role="status">
                    {!owner || owner.status !== 'Verified'
                      ? 'This employer is not verified. The posting cannot be approved until verification is complete.'
                      : ''}
                    {(!owner || owner.status !== 'Verified') && !deadlineOpen ? ' ' : ''}
                    {!deadlineOpen ? 'The application deadline has passed. This posting cannot be approved.' : ''}
                  </div>
                )}
                <h3>Moderator checklist</h3>
                <div className="checklist">
                  {moderatorChecks.map((label, index) => (
                    <label className="check-row" key={label}>
                      <input
                        checked={checks[index] ?? false}
                        onChange={(event) => updateCheck(index, event.target.checked)}
                        type="checkbox"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                <div className="actions">
                  {/* Keep approval disabled until every rule is met. */}
                  <button className="primary" disabled={!canApprove} onClick={approve} type="button">
                    Approve posting
                  </button>
                  {/* Ask for a reason before rejecting the job. */}
                  <button
                    className="danger"
                    onClick={() => setRejectionId(selectedJob.id)}
                    type="button"
                  >
                    Reject posting
                  </button>
                </div>
              </>
            )}

            {/* Show the reason if this job was rejected earlier. */}
            {selectedJob.status === 'Rejected' && selectedJob.reason && (
              <div className="decision-reason">
                <strong>Rejection reason:</strong> {selectedJob.reason}
                {selectedJob.note ? ` — ${selectedJob.note}` : ''}
              </div>
            )}
          </section>
        ) : (
          <section className="panel"><p className="muted">Select a submitted job to review.</p></section>
        )}
      </div>

      {/* Only show the dialog while a job is being rejected. */}
      {rejectingJob && (
        <ReasonDialog
          category="job"
          onClose={() => setRejectionId(null)}
          onConfirm={(reason, note) => {
            const saved = decideJob(rejectingJob.id, 'Rejected', reason, note);
            if (saved) {
              setNotice({ kind: 'success', text: `${rejectingJob.title} was rejected.` });
            }
            // The dialog uses this result to decide whether it can close.
            return saved;
          }}
          subject={rejectingJob.title}
        />
      )}
    </div>
    </Shell>
  );
}
