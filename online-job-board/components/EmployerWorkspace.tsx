'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import Badge from '@/components/Badge';
import ReasonDialog from '@/components/ReasonDialog';
import { APP_STATUSES, EMP_ID } from '@/lib/data';
import { useStore, type JobInput } from '@/lib/store';

type Notice = { kind: 'success' | 'error'; text: string };

export function EmployerDashboard() {
  const { jobs, myApplicants, employers } = useStore();
  const ownedJobs = jobs.filter((job) => job.owner === EMP_ID);
  const employer = employers.find((entry) => entry.id === EMP_ID);
  const latest = [...ownedJobs].sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')).slice(0, 3);
  const stats = [
    { label: 'My vacancies', value: ownedJobs.length },
    { label: 'In review', value: ownedJobs.filter((job) => job.status === 'In review').length },
    { label: 'Published', value: ownedJobs.filter((job) => job.status === 'Published').length },
    { label: 'Applications', value: myApplicants.length },
  ];

  return (
    <div className="content">
      <header className="page-head">
        <p className="eyebrow">Employer workspace</p>
        <h1>Overview</h1>
        <p className="muted">Manage your vacancies and keep candidate reviews moving.</p>
      </header>
      {employer && (employer.status !== 'Verified' || employer.accountStatus !== 'Active') && (
        <div className="notice" role="status">
          Vacancy submissions require an active, verified employer account. Verification: {employer.status}. Account: {employer.accountStatus}.
        </div>
      )}
      <section aria-label="Employer workspace summary" className="stats">
        {stats.map((item) => (
          <div className="card stat-card" key={item.label}>
            <span className="stat-label">{item.label}</span>
            <span className="number">{item.value}</span>
            <span className="small muted">current demo records</span>
          </div>
        ))}
      </section>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>Recent vacancies</h2>
            <Link className="text-button" href="/employer/jobs">View all</Link>
          </div>
          {latest.length ? latest.map((job) => (
            <div className="item-row" key={job.id}>
              <div><strong>{job.title}</strong><p className="small muted">{job.loc} · {job.type}</p></div>
              <Badge status={job.status} />
            </div>
          )) : <p className="empty-state">No vacancies yet. Create your first vacancy to get started.</p>}
          <Link className="button-link primary" href="/employer/jobs/new">Create a vacancy</Link>
        </section>
        <section className="panel">
          <div className="section-heading">
            <h2>Candidate pipeline</h2>
            <Link className="text-button" href="/employer/applications">Review applications</Link>
          </div>
          {APP_STATUSES.map((status) => (
            <div className="item-row" key={status}>
              <span>{status}</span>
              <strong>{myApplicants.filter((person) => person.status === status).length}</strong>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export function EmployerJobsPage() {
  const { jobs, submitJob, closeJob } = useStore();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const ownedJobs = jobs.filter((job) => job.owner === EMP_ID);
  const visibleJobs = ownedJobs.filter((job) =>
    `${job.title} ${job.loc} ${job.type}`.toLowerCase().includes(query.toLowerCase()) &&
    (!statusFilter || job.status === statusFilter),
  );

  return (
    <div className="content">
      <header className="page-head page-head-row">
        <div><p className="eyebrow">Employer workspace</p><h1>My vacancies</h1><p className="muted">Create, edit, submit, and close your own job postings.</p></div>
        <Link className="button-link primary" href="/employer/jobs/new">Create vacancy</Link>
      </header>
      {notice && <div className={`notice ${notice.kind}`} role="status">{notice.text}</div>}
      <section aria-label="Search and filter vacancies" className="panel filter-bar">
        <div className="field"><label htmlFor="vacancy-search">Search vacancies</label><input id="vacancy-search" onChange={(event) => setQuery(event.target.value)} placeholder="Title, location, or type" value={query} /></div>
        <div className="field"><label htmlFor="vacancy-status">Status</label><select id="vacancy-status" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option value="">All statuses</option>{['Draft', 'In review', 'Published', 'Rejected', 'Closed'].map((status) => <option key={status}>{status}</option>)}</select></div>
      </section>
      <section className="panel">
        <h2>Vacancy records <span className="count-label">{visibleJobs.length}</span></h2>
        {visibleJobs.length ? (
          <div className="tablewrap"><table><thead><tr><th>Vacancy</th><th>Location and type</th><th>Deadline</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{visibleJobs.map((job) => (
              <tr key={job.id}>
                <td><strong>{job.title}</strong><br /><span className="small muted">{job.id}</span>{job.reason && <p className="reason-text">{job.reason}{job.note ? ` — ${job.note}` : ''}</p>}</td>
                <td>{job.loc}<br /><span className="small muted">{job.type}</span></td>
                <td>{job.deadline}</td>
                <td><Badge status={job.status} />{job.reviewedAt && <p className="small muted">Reviewed {new Date(job.reviewedAt).toLocaleDateString()}</p>}</td>
                <td><div className="table-actions">
                  {(job.status === 'Draft' || job.status === 'Rejected') && <Link className="text-button" href={`/employer/jobs/${job.id}`}>{job.status === 'Rejected' ? 'Edit & resubmit' : 'Edit draft'}</Link>}
                  {job.status === 'Draft' && <button className="secondary compact" onClick={() => setNotice(submitJob(job.id) ? { kind: 'success', text: `${job.title} submitted for review.` } : { kind: 'error', text: 'Complete all required fields and use a future deadline before submitting.' })} type="button">Submit</button>}
                  {job.status === 'Rejected' && <span className="small muted">Edit this vacancy to resubmit.</span>}
                  {job.status === 'Published' && <button className="danger compact" onClick={() => { if (window.confirm(`Close “${job.title}”? It will no longer be open to new applicants.`)) setNotice(closeJob(job.id) ? { kind: 'success', text: `${job.title} is now closed.` } : { kind: 'error', text: 'This vacancy could not be closed.' }); }} type="button">Close vacancy</button>}
                  {job.status === 'In review' && <span className="small muted">Awaiting administrator review</span>}
                  {job.status === 'Closed' && <span className="small muted">No longer accepting applications</span>}
                </div></td>
              </tr>
            ))}</tbody></table></div>
        ) : <p className="empty-state">No vacancies match your search. Try another filter or create a vacancy.</p>}
      </section>
    </div>
  );
}

const emptyJob: JobInput = {
  title: '',
  loc: '',
  type: 'Full-time',
  deadline: '',
  description: '',
  qualifications: '',
  responsibilities: '',
  skills: '',
};

export function JobEditor({ jobId }: { jobId: string | null }) {
  const { jobs, ready } = useStore();
  const job = jobId ? jobs.find((entry) => entry.id === jobId && entry.owner === EMP_ID) : undefined;
  if (!ready) return <div className="content"><p role="status">Loading vacancy…</p></div>;
  if (jobId && !job) {
    return <div className="content"><section className="panel"><h1>Vacancy not found</h1><p className="muted">This vacancy may not exist or belong to your employer account.</p><Link className="button-link primary" href="/employer/jobs">Return to my vacancies</Link></section></div>;
  }
  return <JobEditorForm job={job} key={job?.id ?? 'new'} />;
}

function JobEditorForm({ job }: { job?: import('@/lib/data').Job }) {
  const router = useRouter();
  const { employers, saveJob } = useStore();
  const jobId = job?.id ?? null;
  const employer = employers.find((entry) => entry.id === EMP_ID);
  const [values, setValues] = useState<JobInput>(() => job ? {
    title: job.title,
    loc: job.loc,
    type: job.type,
    deadline: job.deadline,
    description: job.description,
    qualifications: job.qualifications,
    responsibilities: job.responsibilities,
    skills: job.skills,
  } : emptyJob);
  const [notice, setNotice] = useState<Notice | null>(null);
  const readOnly = !!job && !['Draft', 'Rejected'].includes(job.status);

  const setField = (field: keyof JobInput, value: string) => setValues((current) => ({ ...current, [field]: value }));
  const save = (submit: boolean) => {
    setNotice(null);
    if (submit) {
      const missing = Object.entries(values).find(([key, value]) => key !== 'deadline' && !value.trim());
      const date = values.deadline ? new Date(`${values.deadline}T23:59:59`) : null;
      if (missing || !date || Number.isNaN(date.getTime()) || date <= new Date()) {
        setNotice({ kind: 'error', text: missing ? 'Complete all required fields before submitting.' : 'Choose a future application deadline.' });
        return;
      }
    }
    const savedId = saveJob(jobId, values, submit);
    if (!savedId) {
      setNotice({ kind: 'error', text: 'The vacancy could not be saved. Check your account status and try again.' });
      return;
    }
    if (jobId) {
      setNotice({ kind: 'success', text: submit ? 'Vacancy submitted for review.' : 'Draft saved.' });
    } else {
      router.replace(submit ? '/employer/jobs' : `/employer/jobs/${savedId}`);
    }
  };
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    save(true);
  };

  return (
    <div className="content">
      <header className="page-head"><p className="eyebrow">Employer workspace</p><h1>{readOnly ? job?.title : jobId ? 'Edit vacancy' : 'Create a vacancy'}</h1><p className="muted">{readOnly ? 'Review the submitted vacancy details and current review outcome.' : 'Required fields are marked. Save a draft or validate and submit it for review.'}</p></header>
      {employer && (employer.status !== 'Verified' || employer.accountStatus !== 'Active') && <div className="notice">Your employer account must be active and verified before vacancies can be submitted.</div>}
      {job?.reason && <div className="notice"><strong>Review feedback:</strong> {job.reason}{job.note ? ` — ${job.note}` : ''}</div>}
      {notice && <div className={`notice ${notice.kind}`} role="status">{notice.text}</div>}
      <form className="panel form-panel" onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="field"><label htmlFor="job-title">Job title <span aria-hidden="true">*</span></label><input disabled={readOnly} id="job-title" maxLength={100} onChange={(event) => setField('title', event.target.value)} required value={values.title} /></div>
          <div className="field"><label htmlFor="job-location">Location <span aria-hidden="true">*</span></label><input disabled={readOnly} id="job-location" maxLength={100} onChange={(event) => setField('loc', event.target.value)} required value={values.loc} /></div>
          <div className="field"><label htmlFor="job-type">Employment type <span aria-hidden="true">*</span></label><select disabled={readOnly} id="job-type" onChange={(event) => setField('type', event.target.value)} required value={values.type}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Hybrid</option><option>Remote</option></select></div>
          <div className="field"><label htmlFor="job-deadline">Application deadline <span aria-hidden="true">*</span></label><input disabled={readOnly} id="job-deadline" min={new Date().toISOString().slice(0, 10)} onChange={(event) => setField('deadline', event.target.value)} required type="date" value={values.deadline} /></div>
        </div>
        <div className="field"><label htmlFor="job-description">Description <span aria-hidden="true">*</span></label><textarea disabled={readOnly} id="job-description" maxLength={4000} onChange={(event) => setField('description', event.target.value)} required value={values.description} /></div>
        <div className="field"><label htmlFor="job-qualifications">Qualifications <span aria-hidden="true">*</span></label><textarea disabled={readOnly} id="job-qualifications" maxLength={2000} onChange={(event) => setField('qualifications', event.target.value)} required value={values.qualifications} /></div>
        <div className="field"><label htmlFor="job-responsibilities">Responsibilities <span aria-hidden="true">*</span></label><textarea disabled={readOnly} id="job-responsibilities" maxLength={2000} onChange={(event) => setField('responsibilities', event.target.value)} required value={values.responsibilities} /></div>
        <div className="field"><label htmlFor="job-skills">Skills <span aria-hidden="true">*</span></label><textarea disabled={readOnly} id="job-skills" maxLength={1200} onChange={(event) => setField('skills', event.target.value)} required value={values.skills} /></div>
        {readOnly ? (
          <div className="actions"><Link className="button-link secondary" href="/employer/jobs">Back to vacancies</Link>{job?.reviewedBy && <span className="small muted">Reviewed by {job.reviewedBy}{job.reviewedAt ? ` on ${new Date(job.reviewedAt).toLocaleString()}` : ''}</span>}</div>
        ) : (
          <div className="actions"><button className="secondary" onClick={() => save(false)} type="button">Save draft</button><button className="primary" type="submit">Save and submit</button><Link className="button-link secondary" href="/employer/jobs">Cancel</Link></div>
        )}
      </form>
    </div>
  );
}

export function ApplicationsPage() {
  const { myApplicants, setApplicantStatus } = useStore();
  const [filter, setFilter] = useState('');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectionId, setRejectionId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const visibleApplicants = useMemo(() => myApplicants.filter((applicant) =>
    (!filter || applicant.status === filter) &&
    `${applicant.name} ${applicant.email} ${applicant.job} ${applicant.skills}`.toLowerCase().includes(query.toLowerCase()),
  ), [filter, myApplicants, query]);
  const rejectionApplicant = myApplicants.find((entry) => entry.id === rejectionId);
  const selectedApplicant = myApplicants.find((entry) => entry.id === selectedId);

  const changeStatus = (id: string, value: string) => {
    const status = APP_STATUSES.find((candidate) => candidate === value);
    const applicant = myApplicants.find((candidate) => candidate.id === id);
    if (!status || !applicant || status === applicant.status) return;
    setNotice(null);
    if (status === 'Rejected') {
      setRejectionId(id);
      return;
    }
    setNotice(setApplicantStatus(id, status)
      ? { kind: 'success', text: `${applicant.name} is now ${status}.` }
      : { kind: 'error', text: 'The application status could not be updated.' });
  };

  return (
    <div className="content">
      <header className="page-head"><p className="eyebrow">Employer workspace</p><h1>Applications</h1><p className="muted">Search candidates, review their profiles, and manage each application status.</p></header>
      {notice && <div className={`notice ${notice.kind}`} role="status">{notice.text}</div>}
      <section aria-label="Filter applications by status" className="stats">
        {APP_STATUSES.map((status) => (
          <button aria-pressed={filter === status} className={`card stat-card${filter === status ? ' selected' : ''}`} key={status} onClick={() => setFilter((current) => current === status ? '' : status)} type="button">
            <span className="stat-label">{status}</span><span className="number">{myApplicants.filter((applicant) => applicant.status === status).length}</span><span className="small muted">applications</span>
          </button>
        ))}
      </section>
      <section className="panel">
        <div className="section-heading"><h2>{filter ? `${filter} applications` : 'All applications'} <span className="count-label">{visibleApplicants.length}</span></h2><div className="field search-field"><label htmlFor="applicant-search">Search candidates</label><input id="applicant-search" onChange={(event) => setQuery(event.target.value)} placeholder="Name, email, vacancy, skill" value={query} /></div></div>
        {visibleApplicants.length ? <div className="tablewrap"><table><thead><tr><th>Applicant</th><th>Vacancy</th><th>Applied</th><th>Status</th><th>Update status</th></tr></thead><tbody>
          {visibleApplicants.map((applicant) => (
            <tr key={applicant.id}>
              <td><button className="text-button applicant-name" onClick={() => setSelectedId(applicant.id)} type="button">{applicant.name}</button><br /><span className="muted">{applicant.email}</span></td>
              <td>{applicant.job}</td><td>{applicant.applied}</td>
              <td><Badge status={applicant.status} />{applicant.reason && <p className="reason-text">{applicant.reason}{applicant.note ? ` — ${applicant.note}` : ''}</p>}</td>
              <td><label className="visually-hidden" htmlFor={`status-${applicant.id}`}>Change status for {applicant.name}</label><select id={`status-${applicant.id}`} onChange={(event) => changeStatus(applicant.id, event.target.value)} value={applicant.status}>{APP_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></td>
            </tr>
          ))}
        </tbody></table></div> : <p className="empty-state">No applications match this search or status. Clear the filters to see all candidates.</p>}
      </section>
      {selectedApplicant && (
        <div className="confirm-overlay" onClick={() => setSelectedId(null)} role="presentation">
          <section aria-labelledby="applicant-profile-title" aria-modal="true" className="confirm-dialog" onClick={(event) => event.stopPropagation()} role="dialog">
            <div className="detail-heading"><div><p className="eyebrow">Candidate profile</p><h2 id="applicant-profile-title">{selectedApplicant.name}</h2></div><button aria-label="Close profile" className="secondary" onClick={() => setSelectedId(null)} type="button">Close</button></div>
            <dl className="details-list"><div className="kv"><dt>Email</dt><dd><a href={`mailto:${selectedApplicant.email}`}>{selectedApplicant.email}</a></dd></div><div className="kv"><dt>Phone</dt><dd>{selectedApplicant.phone}</dd></div><div className="kv"><dt>Location</dt><dd>{selectedApplicant.location}</dd></div><div className="kv"><dt>Education</dt><dd>{selectedApplicant.education}</dd></div><div className="kv"><dt>Experience</dt><dd>{selectedApplicant.experience}</dd></div><div className="kv"><dt>Skills</dt><dd>{selectedApplicant.skills}</dd></div></dl>
            <h3>Cover letter</h3><p>{selectedApplicant.coverLetter}</p><p className="small muted">Applied {selectedApplicant.applied} · {selectedApplicant.job}</p>
          </section>
        </div>
      )}
      {rejectionApplicant && <ReasonDialog category="applicant" onClose={() => setRejectionId(null)} onConfirm={(reason, note) => {
        const saved = setApplicantStatus(rejectionApplicant.id, 'Rejected', reason, note);
        if (saved) setNotice({ kind: 'success', text: `${rejectionApplicant.name} was rejected.` });
        return saved;
      }} subject={rejectionApplicant.name} />}
    </div>
  );
}
