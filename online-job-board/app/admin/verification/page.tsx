'use client';

import { useState } from 'react';
import Badge from '@/components/Badge';
import ReasonDialog from '@/components/ReasonDialog';
import { useStore } from '@/lib/store';

const verificationChecks = [
  'Name matches registration',
  'Genuine business email',
  'Plausible phone and address',
  'Not a duplicate',
];

type NoticeMessage = { kind: 'success' | 'error'; text: string };

export default function VerificationPage() {
  const { employers, decideEmployer } = useStore();
  const [selectedId, setSelectedId] = useState('emp-3');
  const [checksByEmployer, setChecksByEmployer] = useState<Record<string, boolean[]>>({});
  const [rejectionId, setRejectionId] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeMessage | null>(null);
  const selectedEmployer = employers.find((employer) => employer.id === selectedId);
  const checks = selectedEmployer
    ? (checksByEmployer[selectedEmployer.id] ?? verificationChecks.map(() => false))
    : [];
  const allChecksComplete = checks.length === verificationChecks.length && checks.every(Boolean);
  const rejectingEmployer = employers.find((employer) => employer.id === rejectionId);

  const updateCheck = (index: number, checked: boolean) => {
    if (!selectedEmployer) return;
    setChecksByEmployer((current) => {
      const nextChecks = [...(current[selectedEmployer.id] ?? verificationChecks.map(() => false))];
      nextChecks[index] = checked;
      return { ...current, [selectedEmployer.id]: nextChecks };
    });
  };

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
    <div className="content">
      <header className="page-head">
        <p className="eyebrow">Admin workspace</p>
        <h1>Employer verification</h1>
        <p className="muted">Review business details before allowing an employer to post jobs.</p>
      </header>

      {notice && (
        <div className={`notice ${notice.kind}`} role="status">
          {notice.text}
        </div>
      )}

      <div className="split">
        <section aria-label="Employers" className="panel">
          <h2>Employers</h2>
          {employers.map((employer) => (
            <button
              aria-pressed={selectedEmployer?.id === employer.id}
              className={`item${selectedEmployer?.id === employer.id ? ' sel' : ''}`}
              key={employer.id}
              onClick={() => {
                setSelectedId(employer.id);
                setNotice(null);
              }}
              type="button"
            >
              <strong>{employer.name}</strong>
              <br />
              <Badge status={employer.status} />
            </button>
          ))}
        </section>

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
                  <button
                    className="primary"
                    disabled={!allChecksComplete}
                    onClick={verify}
                    type="button"
                  >
                    Verify employer
                  </button>
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

      {rejectingEmployer && (
        <ReasonDialog
          category="employer"
          onClose={() => setRejectionId(null)}
          onConfirm={(reason, note) => {
            const saved = decideEmployer(rejectingEmployer.id, 'Rejected', reason, note);
            if (saved) {
              setNotice({ kind: 'success', text: `${rejectingEmployer.name} was rejected.` });
            }
            return saved;
          }}
          subject={rejectingEmployer.name}
        />
      )}
    </div>
  );
}
