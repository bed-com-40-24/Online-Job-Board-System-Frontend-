import "server-only";
import { backendApiRequest } from "@/lib/backend-api";

export type PublicJob = {
  id: string;
  title: string;
  description: string;
  requiredQualifications: string;
  dueDate: string;
  location: string;
  status: string;
  companyId: string;
};

export function isActivePublicJob(job: PublicJob): boolean {
  return job.status.trim().toUpperCase() === "ACTIVE";
}

export function isClosedPublicJob(job: PublicJob): boolean {
  const status = job.status.trim().toUpperCase();
  return status === "CLOSED" || status === "EXPIRED";
}

function isVisiblePublicJob(job: PublicJob): boolean {
  return isActivePublicJob(job) || isClosedPublicJob(job);
}

export type JobSeekerProfile = {
  displayName: string;
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  location?: string;
  biography?: string;
};

export type JobSeekerApplication = {
  id: string;
  jobId: string;
  status: string;
  submittedAt: string;
  job?: { title?: string; location?: string; status?: string };
};

export type JobSeekerEmployerRequest = {
  id?: string;
  companyName: string;
  status: string;
  rejectionReason?: string | null;
  createdAt?: string;
};

function listFromResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (typeof data === "object" && data !== null) {
    const record = data as { content?: unknown; items?: unknown; data?: unknown };
    if (Array.isArray(record.content)) return record.content as T[];
    if (Array.isArray(record.items)) return record.items as T[];
    if (Array.isArray(record.data)) return record.data as T[];
  }
  throw new Error("The backend returned an unexpected list response.");
}

export async function getPublicJobs(
  filters: { query?: string; location?: string } = {},
  accessToken?: string,
) {
  const search = new URLSearchParams({ page: "0", size: "50" });
  if (filters.query) search.set("q", filters.query);
  if (filters.location) search.set("location", filters.location);
  const response = await backendApiRequest<unknown>(`/api/jobs?${search.toString()}`, {
    token: accessToken,
  });
  return listFromResponse<PublicJob>(response).filter(isVisiblePublicJob);
}

export async function getPublicJob(jobId: string, accessToken?: string) {
  return backendApiRequest<PublicJob>(`/api/jobs/${encodeURIComponent(jobId)}`, {
    token: accessToken,
  });
}

export async function getJobSeekerProfile(accessToken: string) {
  return backendApiRequest<JobSeekerProfile>("/api/profile", { token: accessToken });
}

export async function getJobSeekerApplications(accessToken: string) {
  const response = await backendApiRequest<unknown>("/api/applications", { token: accessToken });
  return listFromResponse<JobSeekerApplication>(response);
}

export async function getJobSeekerEmployerRequests(accessToken: string) {
  const response = await backendApiRequest<unknown>("/api/employer-requests", { token: accessToken });
  return listFromResponse<JobSeekerEmployerRequest>(response);
}
