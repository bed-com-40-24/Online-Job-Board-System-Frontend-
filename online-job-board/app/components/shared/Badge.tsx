import type { AppStatus, JobStatus, OrgStatus } from '@/lib/data';

type BadgeProps = {
  status: AppStatus | JobStatus | OrgStatus;
};

export default function Badge({ status }: BadgeProps) {
  const tone =
    status === 'Accepted' || status === 'Verified' || status === 'Published'
      ? 'good'
      : status === 'Rejected'
        ? 'bad'
        : status === 'New' || status === 'Pending' || status === 'In review'
          ? 'warn'
          : '';

  return <span className={`badge${tone ? ` ${tone}` : ''}`}>{status}</span>;
}
