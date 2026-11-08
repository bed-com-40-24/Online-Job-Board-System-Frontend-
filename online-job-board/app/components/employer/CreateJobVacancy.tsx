'use client';

import type { FormEvent } from 'react';
import type { Job } from '@/lib/data';

type VacancyFormProps = {
  job: Job;
  onSaveJob: (event: FormEvent<HTMLFormElement>, submit: boolean) => void;
  onCancel: () => void;
};

export function VacancyForm({ job, onSaveJob, onCancel }: VacancyFormProps) {
  return (
    <form
      className="panel"
      onSubmit={(event) => {
        const submitter = event.nativeEvent instanceof SubmitEvent
          ? event.nativeEvent.submitter
          : null;
        onSaveJob(event, submitter instanceof HTMLButtonElement && submitter.value === 'submit');
      }}
    >
      <div className="formgrid">
        <div className="field">
          <label htmlFor="vacancy-title">Job title</label>
          <input id="vacancy-title" name="title" required defaultValue={job.title} />
        </div>
        <div className="field">
          <label htmlFor="vacancy-location">Location</label>
          <input id="vacancy-location" name="loc" required defaultValue={job.loc} />
        </div>
        <div className="field">
          <label htmlFor="vacancy-deadline">Application deadline</label>
          <input id="vacancy-deadline" name="deadline" type="date" required defaultValue={job.deadline} />
        </div>
        <div className="field wide">
          <label htmlFor="vacancy-description">Description</label>
          <textarea id="vacancy-description" name="description" required defaultValue={job.description} />
        </div>
        <div className="field wide">
          <label htmlFor="vacancy-requirements">Requirements</label>
          <textarea id="vacancy-requirements" name="requirements" required defaultValue={job.requirements} />
        </div>
      </div>
      <button className="primary" type="submit" value="save">Save changes</button>
      <button className="secondary" type="button" onClick={onCancel}>Cancel</button>
      <button className="secondary" type="submit" value="submit">
        Save and submit for review
      </button>
    </form>
  );
}
