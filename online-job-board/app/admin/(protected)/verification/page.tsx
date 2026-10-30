'use client';

import { useState } from 'react';
import Badge from '@/components/Badge';
import ReasonDialog from '@/components/ReasonDialog';
import Shell from '@/components/Shell';
import { useStore } from '@/lib/store';

// All of these checks must be complete before an employer can be verified.
const verificationChecks = [
  'Name matches registration',
  'Genuine business email',
  'Plausible phone and address',
  'Not a duplicate',
];

// Holds the text and type of the message shown after an action.
type NoticeMessage = { kind: 'success' | 'error'; text: string };

// Admin page for checking employer details before they can post jobs.
export default function VerificationPage() {
  const { employers, decideEmployer } = useStore();

  // Keep track of the selected employer and each employer's checklist answers.
  const [selectedId, setSelectedId] = useState('emp-3');
  const [checksByEmployer, setChecksByEmployer] = useState<Record<string, boolean[]>>({});
  // The rejection ID controls which employer's reason dialog is open.
  const [rejectionId, setRejectionId] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeMessage | null>(null);

  const selectedEmployer = employers.find((employer) => employer.id === selectedId);

  // Use this employer's saved answers, or start with every item unticked.
  const checks = selectedEmployer
    ? (checksByEmployer[selectedEmployer.id] ?? verificationChecks.map(() => false))
    : [];
  const allChecksComplete = checks.length === verificationChecks.length && checks.every(Boolean);
  const rejectingEmployer = employers.find((employer) => employer.id === rejectionId);

  // Update one checklist answer without changing the existing state directly.
  const updateCheck = (index: number, checked: boolean) => {
    if (!selectedEmployer) return;
    setChecksByEmployer((current) => {
      // Keep the answers separate for each employer.
      const nextChecks = [...(current[selectedEmployer.id] ?? verificationChecks.map(() => false))];
      nextChecks[index] = checked;
      return { ...current, [selectedEmployer.id]: nextChecks };
    });
  };

  // Verify the employer only if all checklist items are complete.
  const verify = () => {
    if (!selectedEmployer || !allChecksComplete) return;
    const saved = decideEmployer(selectedEmployer.id, 'Verified');
    setNotice(
      saved
        ? { kind: 'success', text: `${selectedEmployer.name} has been verified.` }
        : { kind: 'error', text: 'The employer could not be verified.' },
    );
  };

  return (
    <Shell>
    <div className="content">
      <header className="page-head">
        <p className="eyebrow">Admin workspace</p>
        <h1>Employer verification</h1>
        <p className="muted">Review business details before allowing an employer to post jobs.</p>
        <p className="notice" role="note">
          This workflow uses sample records. Verification decisions are not saved to Oracle.
        </p>
      </header>

      {/* Screen readers announce this message after an action. */}
      {notice && (
        <div className={`notice ${notice.kind}`} role="status">
          {notice.text}
        </div>
      )}

      <div className="split">
        {/* The left side lists all employers. */}
        <section aria-label="Employers" className="panel">
          <h2>Employers</h2>
          {employers.map((employer) => (
            <button
              aria-pressed={selectedEmployer?.id === employer.id}
              className={`item${selectedEmployer?.id === employer.id ? ' sel' : ''}`}
              key={employer.id}
              onClick={() => {
                setSelectedId(employer.id);
                setNotice(null); // Clear the old message when another employer is selected.
              }}
              type="button"
            >
              <strong>{employer.name}</strong>
              <br />
              <Badge status={employer.status} />
            </button>
          ))}
        </section>

        {/* The right side shows details for the selected employer. */}
        {selectedEmployer ? (
          <section aria-live="polite" className="panel">
            <div className="detail-heading">
              <div>
                <p className="eyebrow">Employer details</p>
                <h2>{selectedEmployer.name}</h2>
              </div>
              <Badge status={selectedEmployer.status} />
            </div>
            <dl className="details-list">
              <div className="kv"><dt>Contact person</dt><dd>{selectedEmployer.contact}</dd></div>
              <div className="kv"><dt>Email</dt><dd>{selectedEmployer.email}</dd></div>
              <div className="kv"><dt>Phone</dt><dd>{selectedEmployer.phone}</dd></div>
              <div className="kv"><dt>Industry</dt><dd>{selectedEmployer.industry}</dd></div>
              <div className="kv"><dt>Address</dt><dd>{selectedEmployer.address}</dd></div>
              <div className="kv"><dt>Registration no.</dt><dd>{selectedEmployer.regNo}</dd></div>
            </dl>

            {/* Show the checklist and decision buttons while verification is pending. */}
            {selectedEmployer.status === 'Pending verification' && (
              <>
                <h3>Verification checklist</h3>
                <div className="checklist">
                  {verificationChecks.map((label, index) => (
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
                  {/* Keep this disabled until every checklist item is ticked. */}
                  <button
                    className="primary"
                    disabled={!allChecksComplete}
                    onClick={verify}
                    type="button"
                  >
                    Verify employer
                  </button>
                  {/* Ask for a reason before rejecting the employer. */}
                  <button
                    className="danger"
                    onClick={() => setRejectionId(selectedEmployer.id)}
                    type="button"
                  >
                    Reject employer
                  </button>
                </div>
              </>
            )}

            {/* Show the reason if this employer was rejected earlier. */}
            {selectedEmployer.status === 'Rejected' && selectedEmployer.reason && (
              <div className="decision-reason">
                <strong>Rejection reason:</strong> {selectedEmployer.reason}
                {selectedEmployer.note ? ` — ${selectedEmployer.note}` : ''}
              </div>
            )}
          </section>
        ) : (
          <section className="panel"><p className="muted">No employers to review.</p></section>
        )}
      </div>

      {/* Only show the dialog while an employer is being rejected. */}
      {rejectingEmployer && (
        <ReasonDialog
          category="employer"
          onClose={() => setRejectionId(null)}
          onConfirm={(reason, note) => {
            const saved = decideEmployer(rejectingEmployer.id, 'Rejected', reason, note);
            if (saved) {
              setNotice({ kind: 'success', text: `${rejectingEmployer.name} was rejected.` });
            }
            // The dialog uses this result to decide whether it can close.
            return saved;
          }}
          subject={rejectingEmployer.name}
        />
      )}
    </div>
    </Shell>
  );
}
