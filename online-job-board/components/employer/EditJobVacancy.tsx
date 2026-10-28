import type { FormEvent } from 'react';
import type { Job, Page } from '@/lib/types';
import { ScreenHeading } from './employerHelpers';
import { VacancyForm } from './CreateJobVacancy';

export type EditJobVacancyProps = {
  job: Job;
  onSaveJob: (event: FormEvent<HTMLFormElement>, submit: boolean) => void;
  onNavigate: (page: Page) => void;
  onSetEditingJobId: (id: string | null) => void;
};

export function EditJobVacancy({ job, onSaveJob, onNavigate, onSetEditingJobId }: EditJobVacancyProps) {
  const subtitle = job.status === 'In review'
    ? 'Your changes will update this vacancy while it remains in the review queue.'
    : job.status === 'Published' || job.status === 'Rejected'
      ? 'Changes to this vacancy will be sent for administrator review.'
      : 'Update the vacancy details or submit it for administrator review.';

  return (
    <>
      <ScreenHeading eyebrow="Employer workspace" title="Edit vacancy" subtitle={subtitle} onBack={() => onNavigate('dashboard')} />
      <VacancyForm job={job} onSaveJob={onSaveJob} onCancel={() => { onSetEditingJobId(null); onNavigate('jobs'); }} />
    </>
  );
}
