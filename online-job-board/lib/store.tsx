'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  type Activity,
  type Applicant,
  type AppStatus,
  type Employer,
  type Job,
  type JobStatus,
  type OrgStatus,
  type Role,
  EMP_ID,
  DEMO_ACCOUNTS,
  REASONS,
  REQUIRE_REJECTION_REASON,
  isDeadlineOpen,
  seedActivity,
  seedApplicants,
  seedEmployers,
  seedJobs,
} from './data';
import { can } from './permissions';

export type JobInput = Pick<
  Job,
  'title' | 'loc' | 'type' | 'deadline' | 'description' | 'qualifications' | 'responsibilities' | 'skills'
>;

type StoreContextValue = {
  role: Role | null;
  ready: boolean;
  login: (email: string, password: string) => Role | null;
  logout: () => void;
  resetData: () => void;
  employers: Employer[];
  jobs: Job[];
  applicants: Applicant[];
  activity: Activity[];
  myApplicants: Applicant[];
  saveJob: (id: string | null, input: JobInput, submit?: boolean) => string | null;
  submitJob: (id: string) => boolean;
  closeJob: (id: string) => boolean;
  setApplicantStatus: (id: string, status: AppStatus, reason?: string, note?: string) => boolean;
  decideEmployer: (id: string, status: OrgStatus, reason?: string, note?: string) => boolean;
  setEmployerAccountStatus: (id: string, status: 'Active' | 'Suspended') => boolean;
  decideJob: (id: string, status: JobStatus, reason?: string, note?: string) => boolean;
};

const STORAGE_KEY = 'ojb_demo_data_v1';
const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore(): StoreContextValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used within StoreProvider');
  return value;
}

function isRole(value: string | null): value is Role {
  return value === 'employer' || value === 'admin';
}

function validRejection(category: keyof typeof REASONS, reason?: string, note?: string): boolean {
  if (!REQUIRE_REJECTION_REASON) return true;
  if (!reason || !REASONS[category].includes(reason)) return false;
  return reason !== 'Other' || (note?.trim().length ?? 0) >= 5;
}

function readSavedData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<{
      employers: Employer[];
      jobs: Job[];
      applicants: Applicant[];
      activity: Activity[];
    }>;
    if (
      !Array.isArray(saved.employers) ||
      !Array.isArray(saved.jobs) ||
      !Array.isArray(saved.applicants) ||
      !Array.isArray(saved.activity)
    ) return null;
    return saved as { employers: Employer[]; jobs: Job[]; applicants: Applicant[]; activity: Activity[] };
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);
  const [applicants, setApplicants] = useState<Applicant[]>(seedApplicants);
  const [employers, setEmployers] = useState<Employer[]>(seedEmployers);
  const [jobs, setJobs] = useState<Job[]>(seedJobs);
  const [activity, setActivity] = useState<Activity[]>(seedActivity);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedRole = sessionStorage.getItem('ojb_role');
      const saved = readSavedData();
      if (saved) {
        setEmployers(saved.employers);
        setJobs(saved.jobs);
        setApplicants(saved.applicants);
        setActivity(saved.activity);
      }
      setRole(isRole(savedRole) ? savedRole : null);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ employers, jobs, applicants, activity }));
    } catch {
      // The demo remains usable if browser storage is disabled or full.
    }
  }, [ready, employers, jobs, applicants, activity]);

  const record = (action: string, target: string, description: string) => {
    const actor = role === 'admin' ? 'Administrator' : 'Lakeview Technologies';
    setActivity((current) => [
      {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        actor,
        role: role ?? 'employer',
        action,
        target,
        description,
        at: new Date().toISOString(),
      },
      ...current,
    ]);
  };

  const login = (email: string, password: string): Role | null => {
    const account = DEMO_ACCOUNTS.find(
      (candidate) =>
        candidate.email.toLowerCase() === email.trim().toLowerCase() &&
        candidate.password === password,
    );
    if (!account) return null;
    sessionStorage.setItem('ojb_role', account.role);
    setRole(account.role);
    return account.role;
  };

  const logout = () => {
    sessionStorage.removeItem('ojb_role');
    setRole(null);
  };

  const resetData = () => {
    setEmployers(seedEmployers);
    setJobs(seedJobs);
    setApplicants(seedApplicants);
    setActivity(seedActivity);
  };

  const myApplicants = useMemo(() => {
    const ownedJobIds = new Set(jobs.filter((job) => job.owner === EMP_ID).map((job) => job.id));
    return applicants.filter((applicant) => ownedJobIds.has(applicant.jobId));
  }, [applicants, jobs]);

  const saveJob: StoreContextValue['saveJob'] = (id, input, submit = false) => {
    if (role !== 'employer' || !can(role, 'job.manage')) return null;
    const owner = employers.find((employer) => employer.id === EMP_ID);
    if (!owner || owner.accountStatus !== 'Active' || owner.status !== 'Verified') return null;
    if (
      submit &&
      (!isDeadlineOpen(input.deadline) ||
        !input.title.trim() ||
        !input.loc.trim() ||
        !input.type.trim() ||
        !input.description.trim() ||
        !input.qualifications.trim() ||
        !input.responsibilities.trim() ||
        !input.skills.trim())
    ) return null;
    const now = new Date().toISOString();
    if (id) {
      const current = jobs.find((job) => job.id === id && job.owner === EMP_ID);
      if (!current || (current.status !== 'Draft' && current.status !== 'Rejected')) return null;
      setJobs((items) =>
        items.map((job) =>
          job.id === id
            ? {
                ...job,
                ...input,
                status: submit ? 'In review' : 'Draft',
                reason: undefined,
                note: undefined,
                reviewedBy: undefined,
                reviewedAt: undefined,
                updatedAt: now,
              }
            : job,
        ),
      );
      record(
        submit ? 'Vacancy submitted' : 'Vacancy updated',
        `${id} · ${input.title}`,
        submit ? 'Submitted for administrator review.' : 'Saved as a draft.',
      );
      return id;
    }
    const newId = `JB-${Date.now().toString().slice(-6)}`;
    setJobs((items) => [
      ...items,
      { ...input, id: newId, owner: EMP_ID, status: submit ? 'In review' : 'Draft', updatedAt: now },
    ]);
    record(
      submit ? 'Vacancy submitted' : 'Vacancy created',
      `${newId} · ${input.title}`,
      submit ? 'Submitted for administrator review.' : 'Saved as a draft.',
    );
    return newId;
  };

  const submitJob: StoreContextValue['submitJob'] = (id) => {
    if (role !== 'employer' || !can(role, 'job.manage')) return false;
    const job = jobs.find((entry) => entry.id === id && entry.owner === EMP_ID);
    if (!job || (job.status !== 'Draft' && job.status !== 'Rejected') || !isDeadlineOpen(job.deadline)) {
      return false;
    }
    if (
      !job.title.trim() ||
      !job.loc.trim() ||
      !job.type.trim() ||
      !job.description.trim() ||
      !job.qualifications.trim() ||
      !job.responsibilities.trim() ||
      !job.skills.trim()
    ) return false;
    setJobs((items) =>
      items.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status: 'In review',
              reason: undefined,
              note: undefined,
              reviewedBy: undefined,
              reviewedAt: undefined,
              updatedAt: new Date().toISOString(),
            }
          : entry,
      ),
    );
    record('Vacancy submitted', `${job.id} · ${job.title}`, 'Submitted for administrator review.');
    return true;
  };

  const closeJob: StoreContextValue['closeJob'] = (id) => {
    if (role !== 'employer') return false;
    const job = jobs.find((entry) => entry.id === id && entry.owner === EMP_ID && entry.status === 'Published');
    if (!job) return false;
    setJobs((items) => items.map((entry) => (entry.id === id ? { ...entry, status: 'Closed' } : entry)));
    record('Vacancy closed', `${job.id} · ${job.title}`, 'Employer closed the published vacancy.');
    return true;
  };

  const setApplicantStatus: StoreContextValue['setApplicantStatus'] = (id, status, reason, note) => {
    if (!can(role, status === 'Rejected' ? 'applicant.reject' : 'applicant.update')) return false;
    const applicant = applicants.find((entry) => entry.id === id);
    const ownedJob = applicant && jobs.find((job) => job.id === applicant.jobId && job.owner === EMP_ID);
    if (!applicant || !ownedJob) return false;
    if (status === 'Rejected' && !validRejection('applicant', reason, note)) return false;
    setApplicants((current) =>
      current.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status,
              reason: status === 'Rejected' ? reason : undefined,
              note: status === 'Rejected' ? note?.trim() || undefined : undefined,
            }
          : entry,
      ),
    );
    record(
      'Application status changed',
      `${applicant.name} · ${applicant.job}`,
      status === 'Rejected' ? `Rejected: ${reason}${note ? ` — ${note.trim()}` : ''}` : `Set to ${status}.`,
    );
    return true;
  };

  const decideEmployer: StoreContextValue['decideEmployer'] = (id, status, reason, note) => {
    if (!can(role, 'employer.verify')) return false;
    const employer = employers.find((entry) => entry.id === id);
    if (!employer || employer.status !== 'Pending verification') return false;
    if (status === 'Rejected' && !validRejection('employer', reason, note)) return false;
    if (status !== 'Verified' && status !== 'Rejected') return false;
    const decision = {
      status,
      reason: status === 'Rejected' ? reason : undefined,
      note: status === 'Rejected' ? note?.trim() || undefined : undefined,
      reviewedBy: 'Administrator',
      reviewedAt: new Date().toISOString(),
    };
    setEmployers((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, ...decision } : entry)),
    );
    record(
      `Employer ${status.toLowerCase()}`,
      employer.name,
      status === 'Rejected' ? `Reason: ${reason}${note ? ` — ${note.trim()}` : ''}` : 'Business profile verified.',
    );
    return true;
  };

  const setEmployerAccountStatus: StoreContextValue['setEmployerAccountStatus'] = (id, status) => {
    if (!can(role, 'employer.verify')) return false;
    const employer = employers.find((entry) => entry.id === id);
    if (!employer || employer.accountStatus === status) return false;
    setEmployers((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, accountStatus: status } : entry)),
    );
    record(`Account ${status.toLowerCase()}`, employer.name, `Employer account is now ${status.toLowerCase()}.`);
    return true;
  };

  const decideJob: StoreContextValue['decideJob'] = (id, status, reason, note) => {
    if (!can(role, 'job.moderate')) return false;
    const job = jobs.find((entry) => entry.id === id);
    if (!job || job.status !== 'In review') return false;
    if (status === 'Rejected' && !validRejection('job', reason, note)) return false;
    if (status === 'Published') {
      const owner = employers.find((employer) => employer.id === job.owner);
      if (
        !owner ||
        owner.status !== 'Verified' ||
        owner.accountStatus !== 'Active' ||
        !isDeadlineOpen(job.deadline) ||
        !job.title.trim() ||
        !job.loc.trim() ||
        !job.type.trim() ||
        !job.description.trim() ||
        !job.qualifications.trim() ||
        !job.responsibilities.trim() ||
        !job.skills.trim()
      ) {
        return false;
      }
    } else if (status !== 'Rejected') {
      return false;
    }
    const decision = {
      status,
      reason: status === 'Rejected' ? reason : undefined,
      note: status === 'Rejected' ? note?.trim() || undefined : undefined,
      reviewedBy: 'Administrator',
      reviewedAt: new Date().toISOString(),
    };
    setJobs((current) => current.map((entry) => (entry.id === id ? { ...entry, ...decision } : entry)));
    record(
      `Vacancy ${status.toLowerCase()}`,
      `${job.id} · ${job.title}`,
      status === 'Rejected' ? `Reason: ${reason}${note ? ` — ${note.trim()}` : ''}` : 'Approved and published.',
    );
    return true;
  };

  return (
    <StoreContext.Provider
      value={{
        role,
        ready,
        login,
        logout,
        resetData,
        employers,
        jobs,
        applicants,
        activity,
        myApplicants,
        saveJob,
        submitJob,
        closeJob,
        setApplicantStatus,
        decideEmployer,
        setEmployerAccountStatus,
        decideJob,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
