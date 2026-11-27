"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BackendApiError, backendApiRequest } from "@/lib/backend-api";
import {
  clearJobSeekerSession,
  createJobSeekerSession,
  getJobSeekerSession,
} from "@/lib/job-seeker-session";
import {
  getJobSeekerEmployerRequests,
  getPublicJob,
  isActivePublicJob,
  type JobSeekerProfile,
} from "@/lib/job-seeker-api";

export type JobSeekerActionState = {
  error?: string;
  success?: string;
  redirectTo?: string;
};

type JobSeekerProfileInput = {
  displayName: string;
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  location?: string;
  biography?: string;
};

function value(formData: FormData, key: string): string {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function getProfileInput(
  formData: FormData,
): { profile: JobSeekerProfileInput } | { error: string } {
  const displayName = value(formData, "displayName");
  const fullName = value(formData, "fullName");
  const dateOfBirth = value(formData, "dateOfBirth");
  const phone = value(formData, "phone");
  const location = value(formData, "location");
  const biography = value(formData, "biography");

  if (displayName.length < 2 || displayName.length > 200) {
    return { error: "Display name must be between 2 and 200 characters." };
  }
  if (fullName.length > 200 || phone.length > 50 || location.length > 255 || biography.length > 10000) {
    return { error: "One or more profile fields exceed the allowed length." };
  }
  if (dateOfBirth) {
    const parsedDate = new Date(`${dateOfBirth}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== dateOfBirth
    ) {
      return { error: "Enter a valid date of birth." };
    }
  }

  return {
    profile: {
      displayName,
      ...(fullName ? { fullName } : {}),
      ...(dateOfBirth ? { dateOfBirth } : {}),
      ...(phone ? { phone } : {}),
      ...(location ? { location } : {}),
      ...(biography ? { biography } : {}),
    },
  };
}

function validEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type BackendIdentity = {
  id: string;
  email: string;
  role: string;
  status?: string;
  accountStatus?: string;
};

async function getBackendIdentity(token: string): Promise<BackendIdentity> {
  try {
    return await backendApiRequest<BackendIdentity>("/api/auth/me", {
      token,
      unauthorizedMessage: "The backend could not verify the sign-in token.",
    });
  } catch (error) {
    if (!(error instanceof BackendApiError) || error.status !== 401) throw error;
    return backendApiRequest<BackendIdentity>("/api/users/me", {
      token,
      unauthorizedMessage: "The backend rejected the sign-in token. Please try again.",
    });
  }
}

async function loginRequest(email: string, password: string) {
  return backendApiRequest<{ accessToken: string; expiresIn: number }>("/api/auth/login", {
    method: "POST",
    body: { email, password },
    unauthorizedMessage: "Email or password is incorrect.",
  });
}

function isActiveJobSeeker(user: BackendIdentity): boolean {
  const role = user.role?.trim().toUpperCase();
  const status = (user.status ?? user.accountStatus)?.trim().toUpperCase();
  return role === "JOB_SEEKER" && status === "ACTIVE";
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof BackendApiError ? error.message : fallback;
}

export async function registerJobSeeker(
  _previousState: JobSeekerActionState,
  formData: FormData,
): Promise<JobSeekerActionState> {
  const email = value(formData, "email").toLowerCase();
  const passwordEntry = formData.get("password");
  const confirmationEntry = formData.get("confirmPassword");
  const password = typeof passwordEntry === "string" ? passwordEntry : "";
  const confirmation = typeof confirmationEntry === "string" ? confirmationEntry : "";
  const profileInput = getProfileInput(formData);

  if (!validEmail(email)) return { error: "Enter a valid email address." };
  if ("error" in profileInput) return profileInput;
  if (password.length < 12 || password.length > 72) {
    return { error: "Password must be between 12 and 72 characters." };
  }
  if (password !== confirmation) return { error: "The passwords do not match." };

  try {
    await backendApiRequest("/api/auth/register", {
      method: "POST",
      body: { email, password, role: "JOB_SEEKER" },
    });
  } catch (error) {
    if (error instanceof BackendApiError && error.status === 409) {
      return {
        error: "This email is already registered. Removing an account in the admin panel does not free its email for reuse; contact an administrator to resolve the existing account.",
      };
    }
    console.error("Job seeker account creation failed.", error);
    return { error: errorMessage(error, "Registration could not be completed. Please try again.") };
  }

  try {
    const login = await loginRequest(email, password);
    const user = await getBackendIdentity(login.accessToken);
    if (!isActiveJobSeeker(user)) {
      return {
        success: "Your account was created. Sign in to continue.",
        redirectTo: "/login",
      };
    }

    await createJobSeekerSession({
      id: user.id,
      email: user.email,
      displayName: profileInput.profile.displayName,
      accessToken: login.accessToken,
      expiresIn: login.expiresIn,
    });
    try {
      await backendApiRequest("/api/profile", {
        method: "PUT",
        token: login.accessToken,
        body: profileInput.profile,
      });
    } catch (error) {
      console.error("New job seeker profile could not be saved.", error);
      return {
        success: "Your account was created, but your profile details could not be saved. Review and save your profile to continue.",
        redirectTo: "/job-seeker/profile",
      };
    }
    return {
      success: "Your account has been created.",
      redirectTo: "/job-seeker/dashboard",
    };
  } catch (error) {
    console.error("Job seeker profile setup or automatic sign-in failed.", error);
    return {
      success: "Your account was created. Sign in to complete your profile.",
      redirectTo: "/login",
    };
  }
}

export async function loginJobSeeker(
  _previousState: JobSeekerActionState,
  formData: FormData,
): Promise<JobSeekerActionState> {
  const email = value(formData, "email").toLowerCase();
  const passwordEntry = formData.get("password");
  const password = typeof passwordEntry === "string" ? passwordEntry : "";
  if (!validEmail(email) || password.length === 0 || password.length > 72) {
    return { error: "Enter a valid email address and password." };
  }

  try {
    const login = await loginRequest(email, password);
    const user = await getBackendIdentity(login.accessToken);
    if (!isActiveJobSeeker(user)) {
      return { error: "We couldn't sign you in with this account. Check your details or contact support." };
    }

    let displayName = user.email;
    try {
      const profile = await backendApiRequest<JobSeekerProfile>("/api/profile", {
        token: login.accessToken,
      });
      if (profile.displayName) displayName = profile.displayName;
    } catch (error) {
      if (!(error instanceof BackendApiError) || error.status !== 404) throw error;
    }

    await createJobSeekerSession({
      id: user.id,
      email: user.email,
      displayName,
      accessToken: login.accessToken,
      expiresIn: login.expiresIn,
    });
    return { redirectTo: "/job-seeker/dashboard" };
  } catch (error) {
    console.error("Job seeker sign-in failed.", error);
    return { error: errorMessage(error, "Sign-in is temporarily unavailable. Please try again.") };
  }
}

export async function submitEmployerUpgradeRequest(
  _previousState: JobSeekerActionState,
  formData: FormData,
): Promise<JobSeekerActionState> {
  const session = await getJobSeekerSession();
  if (!session) return { error: "Sign in again before submitting an employer request." };

  const companyName = value(formData, "companyName");
  const businessDescription = value(formData, "businessDescription");
  const location = value(formData, "physicalBusinessAddress");
  const contactPhone = value(formData, "companyPhone");
  const registrationNumber = value(formData, "registrationNumber");
  const vatNumber = value(formData, "vatNumber");
  const certificate = formData.get("businessRegistrationCertificateFile");

  if (companyName.length < 2 || companyName.length > 200) {
    return { error: "Company name must be between 2 and 200 characters." };
  }
  if (businessDescription.length < 2 || businessDescription.length > 10000) {
    return { error: "Enter a company description between 2 and 10000 characters." };
  }
  if (location.length < 2 || location.length > 255) {
    return { error: "Enter a business location between 2 and 255 characters." };
  }
  if (!/^\+?[0-9][0-9\s()-]{6,28}$/.test(contactPhone)) {
    return { error: "Enter a valid company phone number." };
  }
  if (!registrationNumber || registrationNumber.length > 80 || registrationNumber.toUpperCase() === "LEGACY") {
    return { error: "Enter a valid business registration number." };
  }
  if (!vatNumber || vatNumber.length > 80 || vatNumber.toUpperCase() === "LEGACY") {
    return { error: "Enter a valid VAT or tax number." };
  }
  if (!(certificate instanceof File) || certificate.size === 0) {
    return { error: "Upload your business registration certificate." };
  }
  if (certificate.size > 5 * 1024 * 1024) {
    return { error: "The certificate file must be 5 MB or smaller." };
  }
  try {
    const signature = Buffer.from(await certificate.slice(0, 5).arrayBuffer());
    if (signature.toString("ascii") !== "%PDF-") {
      return { error: "Upload a valid PDF business registration certificate." };
    }
  } catch (error) {
    console.error("Unable to read employer business certificate upload.", error);
    return { error: "The certificate file could not be read. Please choose it again." };
  }

  try {
    const existingRequests = await getJobSeekerEmployerRequests(session.accessToken);
    if (existingRequests.some((request) =>
      ["PENDING", "APPROVED"].includes(request.status.toUpperCase()))) {
      return {
        success: "An employer access request for this account has already been submitted.",
      };
    }
    if (existingRequests.some((request) => request.status.toUpperCase() === "REJECTED")) {
      return {
        error: "Your previous employer request was rejected. Contact an administrator before submitting another request.",
      };
    }

    const requestForm = new FormData();
    requestForm.set(
      "application",
      new Blob([JSON.stringify({
        companyName,
        businessDescription,
        contactEmail: session.email,
        contactPhone,
        location,
        registrationNumber,
        vatNumber,
      })], { type: "application/json" }),
    );
    requestForm.set("document", certificate, certificate.name);
    await backendApiRequest("/api/employer-requests", {
      method: "POST",
      token: session.accessToken,
      body: requestForm,
    });
    revalidatePath("/job-seeker/dashboard");
    revalidatePath("/job-seeker/upgrade");
    return { success: "Your employer request was submitted for administrator review." };
  } catch (error) {
    console.error("Job seeker employer upgrade request failed.", error);
    return {
      error: errorMessage(error, "Your employer request could not be submitted. Please try again."),
    };
  }
}

export async function updateJobSeekerProfile(
  _previousState: JobSeekerActionState,
  formData: FormData,
): Promise<JobSeekerActionState> {
  const session = await getJobSeekerSession();
  if (!session) return { error: "Sign in again before updating your profile." };
  const profileInput = getProfileInput(formData);
  if ("error" in profileInput) return profileInput;
  const { profile } = profileInput;
  try {
    await backendApiRequest("/api/profile", {
      method: "PUT",
      token: session.accessToken,
      body: profile,
    });
  } catch (error) {
    console.error("Job seeker profile update failed.", error);
    return { error: errorMessage(error, "The profile could not be updated.") };
  }
  try {
    await createJobSeekerSession({ ...session, displayName: profile.displayName });
  } catch (error) {
    console.error("Job seeker profile updated but session refresh failed.", error);
    return { error: "The profile was saved, but your session could not refresh. Sign out and sign in again." };
  }
  revalidatePath("/job-seeker/dashboard");
  revalidatePath("/job-seeker/profile");
  return { success: "Profile updated." };
}

export async function applyForJob(
  _previousState: JobSeekerActionState,
  formData: FormData,
): Promise<JobSeekerActionState> {
  const session = await getJobSeekerSession();
  if (!session) return { error: "Sign in again before applying for a job." };
  const jobId = value(formData, "jobId");
  const coverLetterEntry = formData.get("coverLetter");
  const coverLetter = typeof coverLetterEntry === "string" ? coverLetterEntry : "";
  const cv = formData.get("cv");
  if (!/^[0-9a-f-]{36}$/i.test(jobId)) return { error: "The selected job is invalid." };
  if (coverLetter.length > 10000) return { error: "Cover letter must be 10,000 characters or fewer." };
  if (!(cv instanceof File) || cv.size === 0) return { error: "Choose a PDF CV to submit." };
  if (cv.size > 5 * 1024 * 1024) return { error: "The CV must be 5 MB or smaller." };
  try {
    const signature = Buffer.from(await cv.slice(0, 5).arrayBuffer());
    if (signature.toString("ascii") !== "%PDF-") return { error: "Upload a valid PDF CV." };
  } catch (error) {
    console.error("Unable to read job seeker CV upload.", error);
    return { error: "The CV could not be read. Choose the file again." };
  }

  const application = new FormData();
  application.set("jobId", jobId);
  application.set("cv", cv, cv.name);
  application.set("coverLetter", coverLetter);
  try {
    const job = await getPublicJob(jobId, session.accessToken);
    if (!isActivePublicJob(job)) {
      return { error: "This vacancy is no longer open for applications." };
    }
    await backendApiRequest("/api/applications", {
      method: "POST",
      token: session.accessToken,
      body: application,
    });
    revalidatePath("/job-seeker/applications");
    return { success: "Your application was submitted." };
  } catch (error) {
    console.error("Job application submission failed.", error);
    return { error: errorMessage(error, "Your application could not be submitted.") };
  }
}

export async function requestJobSeekerPasswordReset(
  _previousState: JobSeekerActionState,
  formData: FormData,
): Promise<JobSeekerActionState> {
  const email = value(formData, "email").toLowerCase();
  if (!validEmail(email)) return { error: "Enter a valid email address." };
  try {
    await backendApiRequest<{ message?: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
    return {
      success: "If an account exists and email delivery is configured, password reset instructions will be sent.",
    };
  } catch (error) {
    console.error("Job seeker password reset request failed.", error);
    return { error: errorMessage(error, "A password reset link could not be requested.") };
  }
}

export async function resetJobSeekerPassword(
  _previousState: JobSeekerActionState,
  formData: FormData,
): Promise<JobSeekerActionState> {
  const resetToken = value(formData, "resetToken");
  const passwordEntry = formData.get("password");
  const confirmationEntry = formData.get("confirmPassword");
  const password = typeof passwordEntry === "string" ? passwordEntry : "";
  const confirmation = typeof confirmationEntry === "string" ? confirmationEntry : "";
  if (!resetToken || resetToken.length > 128) return { error: "This password reset link is invalid." };
  if (password.length < 12 || password.length > 72) {
    return { error: "Password must be between 12 and 72 characters." };
  }
  if (password !== confirmation) return { error: "The passwords do not match." };
  try {
    await backendApiRequest<void>("/api/auth/reset-password", {
      method: "POST",
      body: { resetToken, newPassword: password },
    });
    return { success: "Password updated. You can now sign in." };
  } catch (error) {
    console.error("Job seeker password reset failed.", error);
    return { error: errorMessage(error, "Password could not be updated. Request a new reset link.") };
  }
}

export async function logoutJobSeeker() {
  const session = await getJobSeekerSession();
  if (session?.accessToken) {
    try {
      await backendApiRequest("/api/auth/logout", {
        method: "POST",
        token: session.accessToken,
      });
    } catch (error) {
      console.error("Backend job seeker sign-out failed.", error);
    }
  }
  await clearJobSeekerSession();
  redirect("/login");
}
