"use server";

import { revalidatePath } from "next/cache";
import { BackendApiError, backendApiRequest } from "@/lib/backend-api";
import { getEmployerSession } from "@/lib/employer-session";

export type EmployerWorkspaceActionState = {
  error?: string;
  success?: string;
  redirectTo?: string;
};

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function validId(value: string): boolean {
  return /^[0-9a-f-]{36}$/i.test(value);
}

function failure(error: unknown, action: string): EmployerWorkspaceActionState {
  console.error(`Backend ${action} failed.`, error);
  return {
    error: error instanceof BackendApiError
      ? error.message
      : error instanceof Error
        ? error.message
      : "The request could not be completed. Please try again.",
  };
}

async function getToken(): Promise<string> {
  const session = await getEmployerSession();
  if (!session?.accessToken) throw new BackendApiError("Please sign in again.", 401);
  return session.accessToken;
}

type BackendCompany = { id: string };
type EmployerRequest = {
  companyName: string;
  businessDescription: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  status: string;
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

async function companyId(token: string): Promise<string> {
  const companies = listFromResponse<BackendCompany>(
    await backendApiRequest<unknown>("/api/companies", { token }),
  );
  if (companies[0]?.id) return companies[0].id;

  const requests = listFromResponse<EmployerRequest>(
    await backendApiRequest<unknown>("/api/employer-requests", { token }),
  );
  const approvedRequest = requests.find((request) => request.status.toUpperCase() === "APPROVED");
  if (!approvedRequest) {
    throw new Error("No approved employer request is available to create a company profile.");
  }
  const company = await backendApiRequest<BackendCompany>("/api/companies", {
    method: "POST",
    token,
    body: {
      name: approvedRequest.companyName,
      description: approvedRequest.businessDescription,
      contactEmail: approvedRequest.contactEmail,
      contactPhone: approvedRequest.contactPhone,
      location: approvedRequest.location,
    },
  });
  if (!company.id) throw new Error("The backend did not return a company ID.");
  return company.id;
}

export async function saveEmployerJob(
  _previousState: EmployerWorkspaceActionState,
  formData: FormData,
): Promise<EmployerWorkspaceActionState> {
  try {
    const token = await getToken();
    const id = field(formData, "jobId");
    const title = field(formData, "title");
    const description = field(formData, "description");
    const requirements = field(formData, "requirements");
    const deadline = field(formData, "deadline");
    const location = field(formData, "loc");
    if (id && !validId(id)) return { error: "The vacancy ID is invalid." };
    if (title.length < 2 || description.length < 2 || requirements.length < 2 || !location || !deadline) {
      return { error: "Complete all required vacancy fields." };
    }
    if (!Number.isFinite(Date.parse(`${deadline}T23:59:59`)) ||
      new Date(`${deadline}T23:59:59`) <= new Date()) {
      return { error: "The deadline must be a future date." };
    }
    const company = await companyId(token);
    const savedJob = await backendApiRequest<{ id: string }>(
      id ? `/api/jobs/${encodeURIComponent(id)}` : "/api/jobs",
      {
        method: id ? "PUT" : "POST",
        token,
        body: {
          companyId: company,
          title,
          description,
          requiredQualifications: requirements,
          dueDate: deadline,
          location,
        },
      },
    );
    if (!id && !validId(savedJob.id)) {
      throw new Error("The backend did not return a valid ID for the created vacancy.");
    }
    revalidatePath("/employer/dashboard");
    revalidatePath("/employer/vacancies");
    if (!id) revalidatePath(`/employer/vacancies/${encodeURIComponent(savedJob.id)}`);
    return {
      success: id
        ? "Vacancy updated."
        : "Vacancy submitted. The backend publishes employer vacancies immediately; drafts and admin job review are not supported.",
      ...(!id ? { redirectTo: `/employer/vacancies/${encodeURIComponent(savedJob.id)}` } : {}),
    };
  } catch (error) {
    return failure(error, "vacancy save");
  }
}

export async function closeEmployerJob(
  _previousState: EmployerWorkspaceActionState,
  formData: FormData,
): Promise<EmployerWorkspaceActionState> {
  const id = field(formData, "jobId");
  if (!validId(id)) return { error: "The vacancy ID is invalid." };
  try {
    await backendApiRequest(`/api/jobs/${encodeURIComponent(id)}/close`, {
      method: "PATCH",
      token: await getToken(),
    });
    revalidatePath("/employer/dashboard");
    revalidatePath("/employer/vacancies");
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${encodeURIComponent(id)}`);
    return { success: "Vacancy closed." };
  } catch (error) {
    return failure(error, "vacancy close");
  }
}

export async function deleteEmployerJob(
  _previousState: EmployerWorkspaceActionState,
  formData: FormData,
): Promise<EmployerWorkspaceActionState> {
  const id = field(formData, "jobId");
  if (!validId(id)) return { error: "The vacancy ID is invalid." };
  try {
    await backendApiRequest(`/api/jobs/${encodeURIComponent(id)}`, {
      method: "DELETE",
      token: await getToken(),
    });
    revalidatePath("/employer/dashboard");
    revalidatePath("/employer/vacancies");
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${encodeURIComponent(id)}`);
    return { success: "Vacancy deleted." };
  } catch (error) {
    return failure(error, "vacancy deletion");
  }
}

export async function updateEmployerApplicationStatus(
  _previousState: EmployerWorkspaceActionState,
  formData: FormData,
): Promise<EmployerWorkspaceActionState> {
  const id = field(formData, "applicationId");
  const status = field(formData, "status");
  if (!validId(id)) return { error: "The application ID is invalid." };
  if (status !== "SHORTLISTED" && status !== "REJECTED") {
    return { error: "Choose a supported application status." };
  }
  try {
    await backendApiRequest(`/api/employer/applications/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      token: await getToken(),
      body: { status },
    });
    revalidatePath("/employer/applications");
    revalidatePath(`/employer/applications/${encodeURIComponent(id)}`);
    return { success: `Application ${status.toLowerCase()}.` };
  } catch (error) {
    return failure(error, "application review");
  }
}

export async function getEmployerCvDownloadUrl(applicationId: string): Promise<string> {
  if (!validId(applicationId)) throw new Error("The application ID is invalid.");
  const result = await backendApiRequest<{ url: string }>(
    `/api/employer/applications/${encodeURIComponent(applicationId)}/cv`,
    { token: await getToken() },
  );
  let downloadUrl: URL;
  try {
    downloadUrl = new URL(result.url);
  } catch {
    throw new Error("The backend did not provide a valid CV download URL.");
  }
  const localHttp = downloadUrl.protocol === "http:" &&
    ["localhost", "127.0.0.1", "::1"].includes(downloadUrl.hostname);
  if ((downloadUrl.protocol !== "https:" && !localHttp) || downloadUrl.username || downloadUrl.password) {
    throw new Error("The backend did not provide a secure CV download URL.");
  }
  return downloadUrl.toString();
}

export async function getEmployerApplicantProfile(applicationId: string): Promise<{
  displayName?: string;
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  location?: string;
  biography?: string;
}> {
  if (!validId(applicationId)) throw new Error("The application ID is invalid.");
  return backendApiRequest(
    `/api/employer/applications/${encodeURIComponent(applicationId)}/profile`,
    { token: await getToken() },
  );
}
