'use client';

import { useEffect, useState } from 'react';
import { REASONS, REQUIRE_REJECTION_REASON, type ReasonCategory } from '@/lib/data';

type ReasonDialogProps = {
  category: ReasonCategory;
  subject: string;
  onClose: () => void;
  onConfirm: (reason: string, note: string) => boolean;
};

export default function ReasonDialog({
  category,
  subject,
  onClose,
  onConfirm,
}: ReasonDialogProps) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const continueToConfirmation = () => {
    if (REQUIRE_REJECTION_REASON && !reason) {
      setError('Choose a rejection reason to continue.');
      return;
    }
    if (reason === 'Other' && note.trim().length < 5) {
      setError('Add at least 5 characters of notes when the reason is Other.');
      return;
    }
    setError('');
    setStep(2);
  };

  const confirm = () => {
    if (!onConfirm(reason, note.trim())) {
      setError('This action could not be completed. The item may already have been decided.');
      return;
    }
    onClose();
  };

  return (
    <div
      className="confirm-overlay"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-labelledby="reason-dialog-title"
        aria-modal="true"
        className="confirm-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2 id="reason-dialog-title">
          {step === 1 ? 'Choose a rejection reason' : 'Confirm rejection'}
        </h2>
        {step === 1 ? (
          <>
            <p className="muted">Select a reason for rejecting {subject}.</p>
            <div className="field">
              <label htmlFor="rejection-reason">Reason</label>
              <select
                id="rejection-reason"
                onChange={(event) => {
                  setReason(event.target.value);
                  setError('');
                }}
                required={REQUIRE_REJECTION_REASON}
                value={reason}
              >
                <option value="">Select a reason</option>
                {REASONS[category].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="rejection-note">
                Notes <span className="muted">(optional, except for Other)</span>
              </label>
              <textarea
                id="rejection-note"
                onChange={(event) => {
                  setNote(event.target.value);
                  setError('');
                }}
                value={note}
              />
            </div>
          </>
        ) : (
          <p>
            You are about to reject <strong>{subject}</strong>. Reason: <strong>{reason}</strong>
            {note.trim() ? ` — ${note.trim()}` : ''}
          </p>
        )}
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        <div className="confirm-actions">
          {step === 1 ? (
            <button className="confirm-cancel" onClick={onClose} type="button">
              Cancel
            </button>
          ) : (
            <button className="confirm-cancel" onClick={() => setStep(1)} type="button">
              Back
            </button>
          )}
          {step === 1 ? (
            <button className="primary" onClick={continueToConfirmation} type="button">
              Continue
            </button>
          ) : (
            <button className="danger" onClick={confirm} type="button">
              Confirm rejection
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
