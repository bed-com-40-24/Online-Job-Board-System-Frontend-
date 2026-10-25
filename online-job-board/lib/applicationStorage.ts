import {
  initialApplicants,
  type Applicant,
  type ApplicationStatus,
} from "../data/applicants";

const STORAGE_KEY = "ojb_applications_v1";

function isValidApplicant(value: unknown): value is Applicant {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const applicant = value as Record<string, unknown>;

  return (
    typeof applicant.id === "number" &&
    typeof applicant.name === "string" &&
    typeof applicant.email === "string" &&
    typeof applicant.position === "string" &&
    typeof applicant.appliedDate === "string" &&
    typeof applicant.experience === "string" &&
    typeof applicant.education === "string" &&
    typeof applicant.location === "string" &&
    typeof applicant.phone === "string" &&
    Array.isArray(applicant.skills) &&
    applicant.skills.every((skill) => typeof skill === "string") &&
    ["Pending", "Shortlisted", "Rejected"].includes(
      applicant.status as string
    )
  );
}

export function loadApplications(): Applicant[] {
  if (typeof window === "undefined") {
    return initialApplicants;
  }

  try {
    const savedData = window.localStorage.getItem(STORAGE_KEY);

    if (savedData === null) {
      saveApplications(initialApplicants);
      return initialApplicants;
    }

    const parsedData: unknown = JSON.parse(savedData);

    if (
      !Array.isArray(parsedData) ||
      !parsedData.every(isValidApplicant)
    ) {
      throw new Error("The saved application data is invalid.");
    }

    return parsedData;
  } catch (error) {
    console.error("Unable to load saved applications:", error);
    throw new Error(
      "Saved applications could not be loaded. Check browser storage or reset the demo data."
    );
  }
}

export function saveApplications(applications: Applicant[]): void {
  if (typeof window === "undefined") {
    throw new Error("Browser storage is not available.");
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(applications)
    );
  } catch (error) {
    console.error("Unable to save applications:", error);
    throw new Error(
      "Your changes could not be saved. Browser storage may be unavailable or full."
    );
  }
}

export function changeApplicationStatus(
  applications: Applicant[],
  applicantId: number,
  status: ApplicationStatus
): Applicant[] {
  return applications.map((applicant) =>
    applicant.id === applicantId
      ? { ...applicant, status }
      : applicant
  );
}

export function resetApplications(): Applicant[] {
  saveApplications(initialApplicants);
  return initialApplicants;
}