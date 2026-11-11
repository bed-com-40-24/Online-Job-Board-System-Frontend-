import type { ReactNode } from 'react';

export type VacancyFields = {
  title: string;
  dept: string;
  type: string;
  loc: string;
  deadline: string;
  openings: number;
  description: string;
  requirements: string;
};

export function validateJobVacancy(fields: VacancyFields): string | null {
  if (fields.title.length < 3 || fields.title.length > 160) {
    return 'Job title must be between 3 and 160 characters.';
  }
  if (fields.dept.length < 2 || fields.dept.length > 100) {
    return 'Department must be between 2 and 100 characters.';
  }
  if (fields.type.length < 2 || fields.type.length > 80) {
    return 'Employment type must be between 2 and 80 characters.';
  }
  if (fields.loc.length < 2 || fields.loc.length > 160) {
    return 'Location must be between 2 and 160 characters.';
  }
  if (fields.deadline) {
    const date = new Date(`${fields.deadline}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.deadline)
      || Number.isNaN(date.getTime())
      || date.toISOString().slice(0, 10) !== fields.deadline) {
      return 'Enter a valid application deadline.';
    }
  }
  if (!Number.isInteger(fields.openings) || fields.openings < 1 || fields.openings > 10000) {
    return 'Number of openings must be between 1 and 10,000.';
  }
  if (fields.description.length < 20 || fields.description.length > 20000) {
    return 'Job description must be between 20 and 20,000 characters.';
  }
  if (fields.requirements.length < 10 || fields.requirements.length > 10000) {
    return 'Requirements must be between 10 and 10,000 characters.';
  }
  return null;
}

export function ComprehensiveDataValidation({
  message,
  children,
}: {
  message: string;
  children?: ReactNode;
}) {
  return (
    <>
      {message && <p className="form-error" role="alert">{message}</p>}
      {children}
    </>
  );
}
