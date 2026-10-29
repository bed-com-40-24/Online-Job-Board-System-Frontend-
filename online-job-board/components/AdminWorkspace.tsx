'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import Badge from '@/components/Badge';
import ReasonDialog from '@/components/ReasonDialog';
import type { Role } from '@/lib/data';
import { useStore } from '@/lib/store';

type Notice = { kind: 'success' | 'error'; text: string };

export function AdminDashboard() {
  const { employers, jobs, activity } = useStore();
  const recent = activity.slice(0, 4);
  const stats = [
    { label: 'Employers', value: employers.length, href: '/admin/employers' },
    { label: 'Needs verification', value: employers.filter((employer) => employer.status === 'Pending verification').length, href: '/admin/verification' },
    { label: 'Jobs in review', value: jobs.filter((job) => job.status === 'In review').length, href: '/admin/jobs' },
    { label: 'Published jobs', value: jobs.filter((job) => job.status === 'Published').length, href: '/admin/jobs' },
  ];

  return (
    <div className="content">
      <header className="page-head"><p className="eyebrow">Admin workspace</p><h1>Overview</h1><p className="muted">Monitor employer onboarding, vacancy reviews, and recent decisions.</p></header>
      <section aria-label="Administrator summary" className="stats">
        {stats.map((item) => <Link className="card stat-card stat-link" href={item.href} key={item.label}><span className="stat-label">{item.label}</span><span className="number">{item.value}</span><span className="small muted">view records →</span></Link>)}
      </section>
      <div className="dashboard-grid">
        <section className="panel"><div className="section-heading"><h2>Employer verification queue</h2><Link className="text-button" href="/admin/verification">Review employers</Link></div>
          {employers.filter((employer) => employer.status === 'Pending verification').map((employer) => <div className="item-row" key={employer.id}><div><strong>{employer.name}</strong><p className="small muted">{employer.industry} · {employer.address}</p></div><Badge status={employer.status} /></div>)}
          {!employers.some((employer) => employer.status === 'Pending verification') && <p className="empty-state">No employers are waiting for verification.</p>}
        </section>
        <section className="panel"><div className="section-heading"><h2>Vacancy review queue</h2><Link className="text-button" href="/admin/jobs">Review vacancies</Link></div>
          {jobs.filter((job) => job.status === 'In review').map((job) => <div className="item-row" key={job.id}><div><strong>{job.title}</strong><p className="small muted">{job.loc} · Deadline {job.deadline}</p></div><Badge status={job.status} /></div>)}
          {!jobs.some((job) => job.status === 'In review') && <p className="empty-state">No vacancies are waiting for review.</p>}
        </section>
      </div>
      <section className="panel"><div className="section-heading"><h2>Recent activity</h2><Link className="text-button" href="/admin/activity">View activity feed</Link></div>{recent.length ? recent.map((entry) => <ActivityRow entry={entry} key={entry.id} />) : <p className="empty-state">There is no recorded activity yet.</p>}</section>
    </div>
  );
}

const verificationChecks = [
  'Business name and registration number are consistent',
  'Contact information appears complete',
  'Business address and industry are plausible',
  'No duplicate employer record was found',
];

export function AdminVerificationPage() {
  const { employers, decideEmployer } = useStore();
  const [selectedId, setSelectedId] = useState('emp-3');
  const [checksByEmployer, setChecksByEmployer] = useState<Record<string, boolean[]>>({});
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [rejectionId, setRejectionId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const visible = employers.filter((employer) =>
    `${employer.name} ${employer.email} ${employer.industry} ${employer.regNo}`.toLowerCase().includes(query.toLowerCase()) &&
    (!filter || employer.status === filter),
  );
  const selected = employers.find((employer) => employer.id === selectedId);
  const checks = selected ? checksByEmployer[selected.id] ?? verificationChecks.map(() => false) : [];
  const complete = checks.length === verificationChecks.length && checks.every(Boolean);
  const rejecting = employers.find((employer) => employer.id === rejectionId);
  const verify = () => {
    if (!selected || !complete) return;
    const saved = decideEmployer(selected.id, 'Verified');
    setNotice(saved ? { kind: 'success', text: `${selected.name} has been verified.` } : { kind: 'error', text: 'Employer verification could not be saved.' });
  };

  return (
    <div className="content">
      <header className="page-head"><p className="eyebrow">Admin workspace</p><h1>Employer verification</h1><p className="muted">Search business profiles, review registration details, and record a verification decision.</p></header>
      {notice && <div className={`notice ${notice.kind}`} role="status">{notice.text}</div>}
      <section className="panel filter-bar">
        <div className="field"><label htmlFor="verification-search">Search employers</label><input id="verification-search" onChange={(event) => setQuery(event.target.value)} placeholder="Name, email, industry, registration" value={query} /></div>
        <div className="field"><label htmlFor="verification-status">Verification status</label><select id="verification-status" onChange={(event) => setFilter(event.target.value)} value={filter}><option value="">All statuses</option>{['Pending verification', 'Verified', 'Rejected'].map((status) => <option key={status}>{status}</option>)}</select></div>
      </section>
      <div className="split">
        <section aria-label="Employers" className="panel"><h2>Employers <span className="count-label">{visible.length}</span></h2>
          {visible.map((employer) => <button aria-pressed={selected?.id === employer.id} className={`item${selected?.id === employer.id ? ' sel' : ''}`} key={employer.id} onClick={() => { setSelectedId(employer.id); setNotice(null); }} type="button"><strong>{employer.name}</strong><br /><span className="small muted">{employer.email}</span><br /><Badge status={employer.status} /></button>)}
          {!visible.length && <p className="empty-state">No employers match these filters.</p>}
        </section>
        {selected ? <section aria-live="polite" className="panel">
          <div className="detail-heading"><div><p className="eyebrow">Employer details</p><h2>{selected.name}</h2></div><Badge status={selected.status} /></div>
          <dl className="details-list"><div className="kv"><dt>Contact person</dt><dd>{selected.contact}</dd></div><div className="kv"><dt>Email</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd></div><div className="kv"><dt>Phone</dt><dd>{selected.phone}</dd></div><div className="kv"><dt>Industry</dt><dd>{selected.industry}</dd></div><div className="kv"><dt>Address</dt><dd>{selected.address}</dd></div><div className="kv"><dt>Registration no.</dt><dd>{selected.regNo}</dd></div><div className="kv"><dt>Account status</dt><dd><Badge status={selected.accountStatus} /></dd></div></dl>
          {selected.status === 'Pending verification' && <>
            <h3>Verification checklist</h3><div className="checklist">{verificationChecks.map((label, index) => <label className="check-row" key={label}><input checked={checks[index] ?? false} onChange={(event) => setChecksByEmployer((current) => { const next = [...(current[selected.id] ?? verificationChecks.map(() => false))]; next[index] = event.target.checked; return { ...current, [selected.id]: next }; })} type="checkbox" /><span>{label}</span></label>)}</div>
            <div className="actions"><button className="primary" disabled={!complete} onClick={verify} type="button">Verify employer</button><button className="danger" onClick={() => setRejectionId(selected.id)} type="button">Reject employer</button></div>
          </>}
          {selected.status === 'Rejected' && selected.reason && <div className="decision-reason"><strong>Rejection reason:</strong> {selected.reason}{selected.note ? ` — ${selected.note}` : ''}</div>}
          {selected.reviewedAt && <p className="small muted">Decision by {selected.reviewedBy ?? 'Administrator'} · {new Date(selected.reviewedAt).toLocaleString()}</p>}
        </section> : <section className="panel"><p className="empty-state">Select an employer to see profile details.</p></section>}
      </div>
      {rejecting && <ReasonDialog category="employer" onClose={() => setRejectionId(null)} onConfirm={(reason, note) => {
        const saved = decideEmployer(rejecting.id, 'Rejected', reason, note);
        if (saved) setNotice({ kind: 'success', text: `${rejecting.name} was rejected.` });
        return saved;
      }} subject={rejecting.name} />}
    </div>
  );
}

export function AdminEmployersPage() {
  const { employers, setEmployerAccountStatus } = useStore();
  const [query, setQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const visible = employers.filter((employer) =>
    `${employer.name} ${employer.email} ${employer.contact} ${employer.industry}`.toLowerCase().includes(query.toLowerCase()) &&
    (!accountFilter || employer.accountStatus === accountFilter),
  );

  return (
    <div className="content">
      <header className="page-head"><p className="eyebrow">Admin workspace</p><h1>Employer accounts</h1><p className="muted">Search employer profiles and control account access independently from business verification.</p></header>
      {notice && <div className={`notice ${notice.kind}`} role="status">{notice.text}</div>}
      <section className="panel filter-bar"><div className="field"><label htmlFor="employer-search">Search employers</label><input id="employer-search" onChange={(event) => setQuery(event.target.value)} placeholder="Organization, contact, email, industry" value={query} /></div><div className="field"><label htmlFor="account-status">Account status</label><select id="account-status" onChange={(event) => setAccountFilter(event.target.value)} value={accountFilter}><option value="">All accounts</option><option>Active</option><option>Suspended</option></select></div><Link className="button-link secondary align-end" href="/admin/verification">Open verification decisions</Link></section>
      <section className="panel"><h2>Employer directory <span className="count-label">{visible.length}</span></h2>
        {visible.length ? <div className="tablewrap"><table><thead><tr><th>Organization</th><th>Contact</th><th>Verification</th><th>Account</th><th>Action</th></tr></thead><tbody>
          {visible.map((employer) => <tr key={employer.id}><td><strong>{employer.name}</strong><br /><span className="small muted">{employer.industry} · {employer.address}</span></td><td>{employer.contact}<br /><a className="small" href={`mailto:${employer.email}`}>{employer.email}</a><br /><span className="small muted">{employer.phone}</span></td><td><Badge status={employer.status} />{employer.reason && <p className="reason-text">{employer.reason}</p>}</td><td><Badge status={employer.accountStatus} /></td><td>{employer.accountStatus === 'Active' ? <button className="danger compact" onClick={() => setNotice(setEmployerAccountStatus(employer.id, 'Suspended') ? { kind: 'success', text: `${employer.name} account suspended.` } : { kind: 'error', text: 'Account status could not be updated.' })} type="button">Suspend</button> : <button className="primary compact" onClick={() => setNotice(setEmployerAccountStatus(employer.id, 'Active') ? { kind: 'success', text: `${employer.name} account activated.` } : { kind: 'error', text: 'Account status could not be updated.' })} type="button">Activate</button>}</td></tr>)}
        </tbody></table></div> : <p className="empty-state">No employer accounts match these filters.</p>}
      </section>
    </div>
  );
}

const jobChecks = ['Employer is verified and active', 'Required vacancy details are present', 'Application deadline is still open', 'Posting content is appropriate and clear'];

export function AdminJobsPage() {
  const { jobs, employers, decideJob } = useStore();
  const [selectedId, setSelectedId] = useState('JB-1048');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [checksByJob, setChecksByJob] = useState<Record<string, boolean[]>>({});
  const [rejectionId, setRejectionId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const visible = jobs.filter((job) => {
    const employer = employers.find((entry) => entry.id === job.owner);
    return `${job.title} ${job.loc} ${job.type} ${employer?.name ?? ''}`.toLowerCase().includes(query.toLowerCase()) &&
      (!filter || job.status === filter);
  });
  const selected = jobs.find((job) => job.id === selectedId);
  const owner = selected && employers.find((employer) => employer.id === selected.owner);
  const checks = selected ? checksByJob[selected.id] ?? jobChecks.map(() => false) : [];
  const complete = checks.length === jobChecks.length && checks.every(Boolean);
  const rejecting = jobs.find((job) => job.id === rejectionId);
  const canApprove = !!selected && selected.status === 'In review' && !!owner && owner.status === 'Verified' && owner.accountStatus === 'Active' && complete && new Date(`${selected.deadline}T23:59:59`) > new Date();
  const approve = () => {
    if (!selected || !canApprove) return;
    setNotice(decideJob(selected.id, 'Published') ? { kind: 'success', text: `${selected.title} is approved and published.` } : { kind: 'error', text: 'The vacancy could not be approved. Check the employer and deadline.' });
  };

  return (
    <div className="content">
      <header className="page-head"><p className="eyebrow">Admin workspace</p><h1>Job posting review</h1><p className="muted">Search and filter vacancy submissions, inspect full details, then approve or reject with a reason.</p></header>
      {notice && <div className={`notice ${notice.kind}`} role="status">{notice.text}</div>}
      <section className="panel filter-bar"><div className="field"><label htmlFor="job-review-search">Search vacancies</label><input id="job-review-search" onChange={(event) => setQuery(event.target.value)} placeholder="Title, location, employment type, employer" value={query} /></div><div className="field"><label htmlFor="job-review-status">Status</label><select id="job-review-status" onChange={(event) => setFilter(event.target.value)} value={filter}><option value="">All statuses</option>{['Draft', 'In review', 'Published', 'Rejected', 'Closed'].map((status) => <option key={status}>{status}</option>)}</select></div></section>
      <div className="split">
        <section aria-label="Vacancies" className="panel"><h2>Vacancies <span className="count-label">{visible.length}</span></h2>
          {visible.map((job) => <button aria-pressed={selected?.id === job.id} className={`item${selected?.id === job.id ? ' sel' : ''}`} key={job.id} onClick={() => { setSelectedId(job.id); setNotice(null); }} type="button"><strong>{job.title}</strong><br /><span className="small muted">{employers.find((entry) => entry.id === job.owner)?.name} · {job.loc}</span><br /><Badge status={job.status} /></button>)}
          {!visible.length && <p className="empty-state">No vacancies match these filters.</p>}
        </section>
        {selected ? <section aria-live="polite" className="panel">
          <div className="detail-heading"><div><p className="eyebrow">Vacancy details · {selected.id}</p><h2>{selected.title}</h2></div><Badge status={selected.status} /></div>
          <dl className="details-list"><div className="kv"><dt>Employer</dt><dd>{owner?.name ?? 'Unknown employer'} {owner && <span className="small muted">({owner.status}, {owner.accountStatus})</span>}</dd></div><div className="kv"><dt>Location</dt><dd>{selected.loc}</dd></div><div className="kv"><dt>Employment type</dt><dd>{selected.type}</dd></div><div className="kv"><dt>Deadline</dt><dd>{selected.deadline}</dd></div><div className="kv"><dt>Description</dt><dd>{selected.description}</dd></div><div className="kv"><dt>Qualifications</dt><dd>{selected.qualifications}</dd></div><div className="kv"><dt>Responsibilities</dt><dd>{selected.responsibilities}</dd></div><div className="kv"><dt>Skills</dt><dd>{selected.skills}</dd></div></dl>
          {selected.reason && <div className="decision-reason"><strong>Rejection reason:</strong> {selected.reason}{selected.note ? ` — ${selected.note}` : ''}</div>}
          {selected.status === 'In review' && <><h3>Review checklist</h3><div className="checklist">{jobChecks.map((label, index) => <label className="check-row" key={label}><input checked={checks[index] ?? false} onChange={(event) => setChecksByJob((current) => { const next = [...(current[selected.id] ?? jobChecks.map(() => false))]; next[index] = event.target.checked; return { ...current, [selected.id]: next }; })} type="checkbox" /><span>{label}</span></label>)}</div><div className="actions"><button className="primary" disabled={!canApprove} onClick={approve} type="button">Approve and publish</button><button className="danger" onClick={() => setRejectionId(selected.id)} type="button">Reject vacancy</button></div>{!canApprove && <p className="small muted">Approval requires all checks, an active verified employer, and a future deadline.</p>}</>}
          {selected.reviewedAt && <p className="small muted">Decision by {selected.reviewedBy ?? 'Administrator'} · {new Date(selected.reviewedAt).toLocaleString()}</p>}
        </section> : <section className="panel"><p className="empty-state">Select a vacancy to inspect its details.</p></section>}
      </div>
      {rejecting && <ReasonDialog category="job" onClose={() => setRejectionId(null)} onConfirm={(reason, note) => {
        const saved = decideJob(rejecting.id, 'Rejected', reason, note);
        if (saved) setNotice({ kind: 'success', text: `${rejecting.title} was rejected.` });
        return saved;
      }} subject={rejecting.title} />}
    </div>
  );
}

type ActivityEntry = ReturnType<typeof useStore>['activity'][number];

export function ActivityFeed({ role }: { role: Role }) {
  const { activity } = useStore();
  const [query, setQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const visible = useMemo(() => activity.filter((entry) =>
    entry.role === role &&
    (!actionFilter || entry.action === actionFilter) &&
    `${entry.actor} ${entry.target} ${entry.action} ${entry.description}`.toLowerCase().includes(query.toLowerCase()),
  ), [activity, actionFilter, query, role]);
  const actions = Array.from(new Set(activity.filter((entry) => entry.role === role).map((entry) => entry.action)));

  return <div className="content"><header className="page-head"><p className="eyebrow">{role === 'admin' ? 'Admin' : 'Employer'} workspace</p><h1>Activity</h1><p className="muted">A local audit trail of decisions and changes, including actor and time.</p></header>
    <section className="panel filter-bar"><div className="field"><label htmlFor="activity-search">Search activity</label><input id="activity-search" onChange={(event) => setQuery(event.target.value)} placeholder="Actor, target, or action" value={query} /></div><div className="field"><label htmlFor="activity-action">Action</label><select id="activity-action" onChange={(event) => setActionFilter(event.target.value)} value={actionFilter}><option value="">All actions</option>{actions.map((action) => <option key={action}>{action}</option>)}</select></div></section>
    <section className="panel"><h2>Activity records <span className="count-label">{visible.length}</span></h2>{visible.length ? visible.map((entry) => <ActivityRow entry={entry} key={entry.id} />) : <p className="empty-state">No activity matches your filters yet. New activity is recorded when you take actions.</p>}</section>
  </div>;
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  return <article className="activity-row"><div className="activity-mark" aria-hidden="true">•</div><div className="activity-copy"><div className="activity-heading"><strong>{entry.action}</strong><span className="small muted">{new Date(entry.at).toLocaleString()}</span></div><p>{entry.description}</p><span className="small muted">{entry.target} · by {entry.actor}</span></div></article>;
}
