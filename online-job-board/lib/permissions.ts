import type { Role } from './data';

export type Action =
  | 'applicant.update'
  | 'applicant.reject'
  | 'employer.verify'
  | 'job.moderate'
  | 'job.manage';

export const PERMS: Record<Role, Action[]> = {
  employer: ['applicant.update', 'applicant.reject', 'job.manage'],
  admin: ['employer.verify', 'job.moderate'],
};

export const HOME: Record<Role, string> = {
  employer: '/employer',
  admin: '/admin',
};

export function can(role: Role | null, action: Action): boolean {
  return role !== null && PERMS[role].includes(action);
}
