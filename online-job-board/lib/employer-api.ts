import "server-only";

import type { Applicant, Job, AppStatus, JobStatus } from "@/lib/data";
import { backendApiRequest } from "@/lib/backend-api";

type BackendJob = {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requiredQualifications: string;
  dueDate: string;
  location: string;
  status: string;
};

type BackendApplication = {
  id: string;
  jobId: string;
  applicantId: string;
  applicantDisplayName: string;
  status: string;
  submittedAt: string;
  job?: BackendJob;
  applicantProfile?: { email?: string; fullName?: string; displayName?: string };
};

type BackendCompany = {
  id: string;
  name: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
};

type BackendEmployerRequest = {
  companyName: string;
  businessDescription: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  status: string;
};

export type EmployerCompanyProfile = Omit<BackendCompany, "id">;

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

export async function getEmployerCompanyProfile(
  accessToken: string,
): Promise<EmployerCompanyProfile | null> {
  const [companiesResponse, requestsResponse] = await Promise.all([
    backendApiRequest<unknown>("/api/companies", { token: accessToken }),
    backendApiRequest<unknown>("/api/employer-requests", { token: accessToken }),
  ]);
  const company = listFromResponse<BackendCompany>(companiesResponse)[0];
  if (company) {
    return {
      name: company.name,
      description: company.description,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      location: company.location,
    };
  }

  const approvedRequest = listFromResponse<BackendEmployerRequest>(requestsResponse)
    .find((request) => request.status.toUpperCase() === "APPROVED");
  if (!approvedRequest) return null;

  return {
    name: approvedRequest.companyName,
    description: approvedRequest.businessDescription,
    contactEmail: approvedRequest.contactEmail,
    contactPhone: approvedRequest.contactPhone,
    location: approvedRequest.location,
  };
}

function mapJob(job: BackendJob): Job {
  const statuses: Record<string, JobStatus> = {
    ACTIVE: "Published",
    PUBLISHED: "Published",
    PENDING: "In review",
    IN_REVIEW: "In review",
    DRAFT: "Draft",
    REJECTED: "Rejected",
    CLOSED: "Closed",
    EXPIRED: "Closed",
  };
  return {
    id: job.id,
    owner: job.companyId,
    title: job.title,
    loc: job.location,
    deadline: job.dueDate,
    description: job.description,
    requirements: job.requiredQualifications,
    status: statuses[job.status.toUpperCase()] ?? "In review",
  };
}

function mapApplication(application: BackendApplication): Applicant {
  const status: AppStatus = application.status.toUpperCase() === "SHORTLISTED"
    ? "Shortlisted"
    : application.status.toUpperCase() === "REJECTED"
      ? "Rejected"
      : "New";
  const submittedAt = new Date(application.submittedAt);
  return {
    id: application.id,
    name: application.applicantProfile?.displayName
      ?? application.applicantProfile?.fullName
      ?? application.applicantDisplayName
      ?? "Applicant",
    email: application.applicantProfile?.email ?? "",
    job: application.job?.title ?? "Vacancy",
    jobId: application.jobId,
    status,
    applied: Number.isNaN(submittedAt.getTime())
      ? application.submittedAt
      : submittedAt.toLocaleDateString(),
  };
}

export async function getEmployerWorkspaceData(accessToken: string): Promise<{
  jobs: Job[];
  applicants: Applicant[];
}> {
  const [jobsResponse, applicationsResponse] = await Promise.all([
    backendApiRequest<unknown>("/api/employer/jobs", { token: accessToken }),
    backendApiRequest<unknown>("/api/employer/applications", { token: accessToken }),
  ]);
  return {
    jobs: listFromResponse<BackendJob>(jobsResponse).map(mapJob),
    applicants: listFromResponse<BackendApplication>(applicationsResponse).map(mapApplication),
  };
}

export async function getEmployerJobById(accessToken: string, jobId: string): Promise<Job | null> {
  const jobsResponse = await backendApiRequest<unknown>("/api/employer/jobs", {
    token: accessToken,
  });
  const job = listFromResponse<BackendJob>(jobsResponse).find((entry) => entry.id === jobId);
  return job ? mapJob(job) : null;
}
