'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  type Applicant,
  type AppStatus,
  type Employer,
  type Job,
  type JobStatus,
  type OrgStatus,
  type Role,
  EMP_ID,
  REASONS,
  REQUIRE_REJECTION_REASON,
  isDeadlineOpen,
  seedApplicants,
  seedEmployers,
  seedJobs,
} from './data';
import { can } from './permissions';

type StoreContextValue = {
  role: Role | null;
  ready: boolean;
  login: (role: Role) => void;
  logout: () => void;
  employers: Employer[];
  jobs: Job[];
  myApplicants: Applicant[];
  setApplicantStatus: (id: string, status: AppStatus, reason?: string, note?: string) => boolean;
  decideEmployer: (id: string, status: OrgStatus, reason?: string, note?: string) => boolean;
  decideJob: (
    id: string,
    status: JobStatus,
    reason?: string,
    note?: string,
    checklistComplete?: boolean,
  ) => boolean;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore(): StoreContextValue {
  const value = useContext(StoreContext);
  if (!value) {
    throw new Error('useStore must be used within StoreProvider');
  }
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);
  const [applicants, setApplicants] = useState<Applicant[]>(seedApplicants);
  const [employers, setEmployers] = useState<Employer[]>(seedEmployers);
  const [jobs, setJobs] = useState<Job[]>(seedJobs);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedRole = sessionStorage.getItem('ojb_role');
      setRole(isRole(savedRole) ? savedRole : null);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const login = (nextRole: Role) => {
    sessionStorage.setItem('ojb_role', nextRole);
    setRole(nextRole);
  };

  const logout = () => {
    sessionStorage.removeItem('ojb_role');
    setRole(null);
  };

  const myApplicants = useMemo(() => {
    const ownedJobIds = new Set(jobs.filter((job) => job.owner === EMP_ID).map((job) => job.id));
    return applicants.filter((applicant) => ownedJobIds.has(applicant.jobId));
  }, [applicants, jobs]);

  const setApplicantStatus: StoreContextValue['setApplicantStatus'] = (id, status, reason, note) => {
    if (!can(role, status === 'Rejected' ? 'applicant.reject' : 'applicant.update')) return false;
    const applicant = applicants.find((entry) => entry.id === id);
    const ownedJob = applicant && jobs.some((job) => job.id === applicant.jobId && job.owner === EMP_ID);
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
    return true;
  };

  const decideEmployer: StoreContextValue['decideEmployer'] = (id, status, reason, note) => {
    if (!can(role, 'employer.verify')) return false;
    const employer = employers.find((entry) => entry.id === id);
    if (!employer || employer.status !== 'Pending verification') return false;
    if (status === 'Rejected' && !validRejection('employer', reason, note)) return false;
    if (status !== 'Verified' && status !== 'Rejected') return false;

    setEmployers((current) =>
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
    return true;
  };

  const decideJob: StoreContextValue['decideJob'] = (
    id,
    status,
    reason,
    note,
    checklistComplete = false,
  ) => {
    if (!can(role, 'job.moderate')) return false;
    const job = jobs.find((entry) => entry.id === id);
    if (!job || job.status !== 'In review') return false;
    if (status === 'Rejected' && !validRejection('job', reason, note)) return false;
    if (status === 'Published') {
      const owner = employers.find((employer) => employer.id === job.owner);
      if (!owner || owner.status !== 'Verified' || !isDeadlineOpen(job.deadline) || !checklistComplete) {
        return false;
      }
    } else if (status !== 'Rejected') {
      return false;
    }

    setJobs((current) =>
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
    return true;
  };

  return (
    <StoreContext.Provider
      value={{
        role,
        ready,
        login,
        logout,
        employers,
        jobs,
        myApplicants,
        setApplicantStatus,
        decideEmployer,
        decideJob,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
