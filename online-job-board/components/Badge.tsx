import type { AccountStatus, AppStatus, JobStatus, OrgStatus } from '@/lib/data';

type BadgeProps = {
  status: AccountStatus | AppStatus | JobStatus | OrgStatus;
};

export default function Badge({ status }: BadgeProps) {
  const tone =
    status === 'Accepted' || status === 'Verified' || status === 'Published' || status === 'Active'
      ? 'good'
      : status === 'Rejected' || status === 'Suspended'
        ? 'bad'
        : status === 'Pending' || status === 'Pending verification' || status === 'In review'
          ? 'warn'
          : '';

  return <span className={`badge${tone ? ` ${tone}` : ''}`}>{status}</span>;
}
