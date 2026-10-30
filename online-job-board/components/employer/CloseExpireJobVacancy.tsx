import type { Job } from '@/lib/data';

export type CloseExpireJobVacancyProps = {
  job: Job;
  onAskConfirm: (message: string, run: () => void) => void;
  onUpdateJobStatus: (id: string, status: string) => void;
  onDeleteJob: (id: string) => void;
};

export function CloseExpireJobVacancy({ job, onAskConfirm, onUpdateJobStatus, onDeleteJob }: CloseExpireJobVacancyProps) {
  return (
    <>
      <button
        className="close-action"
        type="button"
        disabled={job.status === 'Closed'}
        title={job.status === 'Closed' ? 'This vacancy has already been closed.' : undefined}
        onClick={() => onAskConfirm('Close this vacancy?', () => onUpdateJobStatus(job.id, 'Closed'))}
      >
        {job.status === 'Closed' ? 'Vacancy closed' : 'Close vacancy'}
      </button>
      <p><button className="danger" onClick={() => onAskConfirm('Permanently delete this vacancy? This cannot be undone.', () => onDeleteJob(job.id))}>Delete vacancy</button></p>
    </>
  );
}
