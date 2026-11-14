'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  type Applicant,
  type AppStatus,
  type Employer,
  type Job,
  type JobStatus,
  type Role,
  EMP_ID,
  REASONS,
  REQUIRE_REJECTION_REASON,
  isDeadlineOpen,
  seedApplicants,
  seedEmployers,
  seedJobs,
  getEmployerVerificationStatus,
} from './data';
import { can } from './permissions';

type StoreContextValue = {
  role: Role | null;
  ready: boolean;
  login: (role: Role) => void;
  logout: () => void;
  employers: Employer[];
  jobs: Job[];
  adminActivity: AdminActivity[];
  myApplicants: Applicant[];
  setApplicantStatus: (id: string, status: AppStatus, reason?: string, note?: string) => boolean;
  decideJob: (
    id: string,
    status: JobStatus,
    reason?: string,
    note?: string,
    checklistComplete?: boolean,
  ) => boolean;
  createEmployerJob: (job: Omit<Job, 'id' | 'owner' | 'status'>, status: 'Draft' | 'In review') => boolean;
  updateEmployerJob: (id: string, job: Omit<Job, 'id' | 'owner' | 'status'>) => boolean;
  setEmployerJobStatus: (id: string, status: 'In review' | 'Closed') => boolean;
  deleteEmployerJob: (id: string) => boolean;
};

export type AdminActivity = {
  id: string;
  title: string;
  detail: string;
  href: string;
  createdAt: string;
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

export function StoreProvider({
  children,
  initialRole = null,
}: {
  children: ReactNode;
  initialRole?: Role | null;
}) {
  const [role, setRole] = useState<Role | null>(() => initialRole);
  const [ready, setReady] = useState(() => initialRole !== null);
  const [applicants, setApplicants] = useState<Applicant[]>(seedApplicants);
  const [employers, setEmployers] = useState<Employer[]>(() => seedEmployers.map((employer) => ({
    ...employer,
    status: employer.status === 'Rejected'
      ? 'Rejected'
      : getEmployerVerificationStatus(employer),
  })));
  const [jobs, setJobs] = useState<Job[]>(seedJobs);
  const [adminActivity, setAdminActivity] = useState<AdminActivity[]>([]);

  const recordAdminActivity = (title: string, detail: string, href: string) => {
    setAdminActivity((current) => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, title, detail, href, createdAt: new Date().toISOString() },
      ...current,
    ].slice(0, 20));
  };

  useEffect(() => {
    if (initialRole) return;

    const timer = window.setTimeout(() => {
      const savedRole = sessionStorage.getItem('ojb_role');
      setRole(isRole(savedRole) ? savedRole : null);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialRole]);

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
    recordAdminActivity('Application status updated', `Updated ${applicant.name}'s application for ${applicant.job}.`, '/admin/activity');
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
    recordAdminActivity(
      status === 'Verified' ? 'Employer verified' : 'Employer rejected',
      `${employer.name} (${employer.id}) was ${status.toLowerCase()}.`,
      '/admin/verification',
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
    recordAdminActivity(
      status === 'Published' ? 'Vacancy published' : 'Vacancy rejected',
      `${job.title} (${job.id}) was ${status === 'Published' ? 'published' : 'rejected'}.`,
      '/admin/jobs',
    );
    return true;
  };

  const createEmployerJob: StoreContextValue['createEmployerJob'] = (job, status) => {
    if (role !== 'employer') return false;
    const highestId = jobs.reduce((highest, entry) => {
      const match = /^JB-(\d+)$/.exec(entry.id);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    const newJob: Job = {
      ...job,
      id: `JB-${highestId + 1}`,
      owner: EMP_ID,
      status,
    };
    setJobs((current) => [newJob, ...current]);
    return true;
  };

  const updateEmployerJob: StoreContextValue['updateEmployerJob'] = (id, job) => {
    if (role !== 'employer') return false;
    const existingJob = jobs.find((entry) => entry.id === id && entry.owner === EMP_ID);
    if (!existingJob || existingJob.status === 'Closed') return false;
    setJobs((current) => current.map((entry) =>
      entry.id === id && entry.owner === EMP_ID ? { ...entry, ...job } : entry,
    ));
    return true;
  };

  const setEmployerJobStatus: StoreContextValue['setEmployerJobStatus'] = (id, status) => {
    if (role !== 'employer') return false;
    const existingJob = jobs.find((entry) => entry.id === id && entry.owner === EMP_ID);
    if (!existingJob || existingJob.status === 'Closed') return false;
    if (status === 'In review' && existingJob.status !== 'Draft') return false;
    setJobs((current) => current.map((entry) =>
      entry.id === id && entry.owner === EMP_ID ? { ...entry, status } : entry,
    ));
    return true;
  };

  const deleteEmployerJob: StoreContextValue['deleteEmployerJob'] = (id) => {
    if (role !== 'employer' || !jobs.some((entry) => entry.id === id && entry.owner === EMP_ID)) return false;
    setJobs((current) => current.filter((entry) => !(entry.id === id && entry.owner === EMP_ID)));
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
        adminActivity,
        myApplicants,
        setApplicantStatus,
        decideJob,
        createEmployerJob,
        updateEmployerJob,
        setEmployerJobStatus,
        deleteEmployerJob,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
