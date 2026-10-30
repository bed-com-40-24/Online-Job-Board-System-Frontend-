import type { Job } from '@/lib/data';

export type PublishSubmitJobVacancyProps = {
  job: Job;
  onAskConfirm: (message: string, run: () => void) => void;
  onUpdateJobStatus: (id: string, status: string) => void;
};

export function PublishSubmitJobVacancy({ job, onAskConfirm, onUpdateJobStatus }: PublishSubmitJobVacancyProps) {
  const canSubmit = job.status === 'Draft';
  const label = job.status === 'In review'
    ? 'Vacancy already submitted'
    : job.status === 'Published' || job.status === 'Rejected'
      ? 'Edit vacancy to resubmit'
      : job.status === 'Closed'
        ? 'Vacancy closed'
        : 'Submit for review';

  return (
    <p>
      <button
        className="secondary"
        type="button"
        disabled={!canSubmit}
        title={canSubmit ? undefined : 'Edit the vacancy details before submitting it again.'}
        onClick={() => onAskConfirm('Submit this vacancy for review?', () => onUpdateJobStatus(job.id, 'In review'))}
      >
        {label}
      </button>
    </p>
  );
}
