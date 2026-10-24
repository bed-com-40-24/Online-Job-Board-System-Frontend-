"use client";
import ApplicantDetailsModal from "../components/applications/ApplicantDetailsModal";

import ApplicationsTable from "../components/applications/ApplicationsTable";
import ApplicationStats from "../components/applications/ApplicationStats";
import ApplicationFilters from "../components/applications/ApplicationFilters";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  loadApplications,
  saveApplications,
  resetApplications,
} from "../lib/applicationStorage";

import type {
  Applicant,
  ApplicationStatus,
} from "../data/applicants";

const statusClass: Record<ApplicationStatus, string> = {
  Pending: "status-pending",
  Shortlisted: "status-shortlisted",
  Rejected: "status-rejected",
};

type EmployerProfile = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  website: string;
  location: string;
  overview: string;
  picture: string;
};

const defaultProfile: EmployerProfile = {
  companyName: "Lakeview Technologies",
  contactPerson: "Alex Morgan",
  email: "employer@onlinejobboard.mw",
  phone: "+265 999 123 456",
  industry: "Information Technology",
  website: "",
  location: "Lilongwe, Malawi",
  overview:
    "Building useful digital products and growing Malawi's technology talent.",
  picture: "",
};

const PROFILE_STORAGE_KEY = "ojb_employer_profile";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isEmployerProfile(value: unknown): value is EmployerProfile {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const profile = value as Record<string, unknown>;

  return (
    typeof profile.companyName === "string" &&
    typeof profile.contactPerson === "string" &&
    typeof profile.email === "string" &&
    typeof profile.phone === "string" &&
    typeof profile.industry === "string" &&
    typeof profile.website === "string" &&
    typeof profile.location === "string" &&
    typeof profile.overview === "string" &&
    (typeof profile.picture === "string" ||
      typeof profile.picture === "undefined")
  );
}
export default function ApplicationsPage() {
  // Applications
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Applicant details
  const [selectedApplicant, setSelectedApplicant] =
    useState<Applicant | null>(null);

  // Notifications
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [feedback, setFeedback] = useState("");

  // Employer profile
  const [profile, setProfile] =
    useState<EmployerProfile>(defaultProfile);

  const [showProfile, setShowProfile] = useState(false);

  // Load applications.
  useEffect(() => {
    try {
      setApplicants(loadApplications());
      setLoadError(false);
    } catch (error) {
      console.error("Could not load applications:", error);
      setLoadError(true);
      setFeedback(
        "Could not load saved applications. Please check your browser storage."
      );
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save application changes.
  useEffect(() => {
    if (!isLoaded || loadError) {
      return;
    }

    try {
      saveApplications(applicants);
    } catch (error) {
      console.error("Could not save applications:", error);

      setFeedback(
        "Could not save application changes. Please check your browser storage."
      );
    }
  }, [applicants, isLoaded, loadError]);

  // Load employer profile.
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(
        PROFILE_STORAGE_KEY
      );

      if (savedProfile) {
        const parsedProfile: unknown = JSON.parse(savedProfile);

        if (isEmployerProfile(parsedProfile)) {
          setProfile(parsedProfile);
        }
      }
    } catch (error) {
      console.error("Could not load employer profile:", error);

      setFeedback(
        "Could not load the saved employer profile."
      );
    }
  }, []);

  // Search and filter applications.
  const filteredApplicants = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return applicants.filter((applicant) => {
      const matchesSearch =
        applicant.name.toLowerCase().includes(query) ||
        applicant.email.toLowerCase().includes(query) ||
        applicant.position.toLowerCase().includes(query) ||
        applicant.skills.some((skill) =>
          skill.toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "All" ||
        applicant.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applicants, searchTerm, statusFilter]);

  // Application statistics.
  const pendingCount = applicants.filter(
    (applicant) => applicant.status === "Pending"
  ).length;

  const shortlistedCount = applicants.filter(
    (applicant) => applicant.status === "Shortlisted"
  ).length;

  const rejectedCount = applicants.filter(
    (applicant) => applicant.status === "Rejected"
  ).length;

  // Change an applicant's status.
  function updateApplicantStatus(
    applicantId: number,
    newStatus: ApplicationStatus
  ) {
    const applicant = applicants.find(
      (item) => item.id === applicantId
    );

    if (!applicant) {
      setFeedback(
        "Application not found. Please refresh the page."
      );
      return;
    }

    if (applicant.status === newStatus) {
      setFeedback(
        `${applicant.name} is already ${newStatus.toLowerCase()}.`
      );
      return;
    }

    setApplicants((currentApplicants) =>
      currentApplicants.map((item) =>
        item.id === applicantId
          ? { ...item, status: newStatus }
          : item
      )
    );

    setSelectedApplicant((currentApplicant) =>
      currentApplicant?.id === applicantId
        ? { ...currentApplicant, status: newStatus }
        : currentApplicant
    );

    setFeedback(
      `${applicant.name} has been ${newStatus.toLowerCase()}.`
    );
  }

  // Display prototype messages.
  function showPrototypeMessage(message: string) {
    setFeedback(message);
  }

  // Update profile fields.
  function updateProfileField(
    field: keyof EmployerProfile,
    value: string
  ) {
    setProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value,
    }));
  }

  // Save employer profile.
  function saveEmployerProfile(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(profile)
      );

      setFeedback("Organisation profile saved successfully.");
      setShowProfile(false);
    } catch (error) {
      console.error("Could not save employer profile:", error);

      setFeedback(
        "Could not save your profile. Please use a smaller picture or check browser storage."
      );
    }
  }

  // Upload organisation picture.
  function handleProfilePicture(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFeedback("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      setFeedback(
        "Please choose an image smaller than 1 MB."
      );
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfile((currentProfile) => ({
          ...currentProfile,
          picture: reader.result as string,
        }));

        setFeedback(
          "Picture selected. Click Save profile to keep your changes."
        );
      }
    };

    reader.onerror = () => {
      setFeedback(
        "Could not read the selected picture. Please try again."
      );
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-label">WORKSPACE</div>

        <a href="#" className="brand">
          <span className="brand-mark">OJB</span>
          <span>OnlineJobBoard</span>
          <span className="brand-menu" aria-hidden="true">
            ☰
          </span>
        </a>

        <nav aria-label="Main navigation">
          <a
            href="#applications"
            className="nav-item nav-item-active"
            aria-current="page"
          >
            <span aria-hidden="true">♙</span>
            <span>Applications</span>
            <span className="nav-count">
              {applicants.length}
            </span>
          </a>

          <a
            href="#"
            className="nav-item"
            onClick={(event) => {
              event.preventDefault();

              showPrototypeMessage(
                "The Candidates page is not implemented in this prototype."
              );
            }}
          >
            <span aria-hidden="true">♧</span>
            <span>Candidates</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="company-avatar">
            {getInitials(profile.companyName)}
          </div>

          <div>
            <strong>{profile.companyName}</strong>
            <span className="muted">Employer account</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-panel">
        {/* TOP HEADER */}
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> Applications
          </div>

          <div className="profile">
            <button
              type="button"
              className="notification"
              aria-label="Notifications"
              title="Notifications"
              onClick={() =>
                showPrototypeMessage(
                  "You are all caught up. Notifications are sample-only."
                )
              }
            >
              ♧
            </button>

            <details className="profile-menu">
              <summary
                className="profile-trigger"
                aria-label="Open employer profile menu"
              >
                {profile.picture ? (
                  <img
                    src={profile.picture}
                    alt="Organisation profile"
                    className="profile-avatar"
                  />
                ) : (
                  <span className="profile-avatar">
                    {getInitials(profile.companyName)}
                  </span>
                )}

                <span className="profile-info">
                  <strong>{profile.companyName}</strong>
                  <span className="muted">Employer</span>
                </span>

                <span
                  className="profile-chevron"
                  aria-hidden="true"
                >
                  ⌄
                </span>
              </summary>

              <div className="profile-dropdown">
                <div className="dropdown-heading">
                  <strong>{profile.companyName}</strong>
                  <span>Employer account</span>
                </div>

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => setShowProfile(true)}
                >
                  <span aria-hidden="true">👤</span>
                  My Profile
                </button>

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() =>
                    showPrototypeMessage(
                      "Change password will be available when authentication is connected."
                    )
                  }
                >
                  <span aria-hidden="true">🔒</span>
                  Change password
                </button>

                <div className="dropdown-divider" />

                <button
                  type="button"
                  className="dropdown-item dropdown-logout"
                  onClick={() =>
                    showPrototypeMessage(
                      "Sign out will be available when authentication is connected."
                    )
                  }
                >
                  <span aria-hidden="true">↪</span>
                  Sign out
                </button>
              </div>
            </details>
          </div>
        </header>

        {/* APPLICATIONS PAGE */}
        <div className="page-content" id="applications">
          <section className="page-heading">
            <div>
              <p className="eyebrow">EMPLOYER WORKSPACE</p>
              <h1>Applications</h1>

              <p className="subtitle">
                Manage candidates and review applications for your jobs.
              </p>
            </div>
          </section>

          {/* FEEDBACK */}
          {feedback && (
            <div className="notice" role="status">
              <span>{feedback}</span>

              <button
                type="button"
                className="notice-close"
                aria-label="Dismiss message"
                onClick={() => setFeedback("")}
              >
                ×
              </button>
            </div>
          )}

          {/* WELCOME NOTICE */}
          {noticeVisible && (
            <div className="notice">
              <div>
                <strong>
                  Welcome to your applications dashboard.
                </strong>{" "}
                Review applicant details and update their application
                status here.
              </div>

              <button
                type="button"
                className="notice-close"
                aria-label="Dismiss welcome message"
                onClick={() => setNoticeVisible(false)}
              >
                ×
              </button>
            </div>
          )}

          {/* STATISTICS */}
<ApplicationStats
  total={applicants.length}
  pending={pendingCount}
  shortlisted={shortlistedCount}
  rejected={rejectedCount}
/>

          {/* APPLICATIONS TABLE */}
          <section className="applications-card">
            <div className="card-heading">
              <div>
                <h2>All Applications</h2>
                <span className="muted">
                  Review and manage candidate submissions.
                </span>
              </div>

              <div className="card-heading-actions">
  <span className="result-count">
    {filteredApplicants.length} results
  </span>

  <button
    type="button"
    className="button button-secondary"
    onClick={() => {
      const confirmed = window.confirm(
        "Reset all application data to the original demo data? Your application status changes will be lost."
      );

      if (!confirmed) return;

      try {
        const originalApplicants = resetApplications();
        setApplicants(originalApplicants);
        setSearchTerm("");
        setStatusFilter("All");
        setFeedback("Demo applications have been reset successfully.");
      } catch (error) {
        console.error("Unable to reset demo applications:", error);
        setFeedback("Could not reset the demo applications. Please try again.");
      }
    }}
  >
    Reset Data
  </button>
</div>
            </div>

            <ApplicationFilters
  searchTerm={searchTerm}
  statusFilter={statusFilter}
  onSearchChange={setSearchTerm}
  onStatusChange={setStatusFilter}
/>

            {/* TABLE */}
<ApplicationsTable
  applicants={filteredApplicants}
  onView={setSelectedApplicant}
  onUpdateStatus={updateApplicantStatus}
  getInitials={getInitials}
/>

<button
  type="button"
  className="button button-primary"
  onClick={() => {
    setSearchTerm("");
    setStatusFilter("All");
  }}
  hidden={filteredApplicants.length !== 0}
>
  Clear filters
</button>
          </section>

          <footer className="footer-note">
            JobBoard Employer Workspace - Application Management Section
          </footer>
        </div>
      </main>

      {/* APPLICANT DETAILS MODAL */}
{selectedApplicant && (
  <ApplicantDetailsModal
    applicant={selectedApplicant}
    onClose={() => setSelectedApplicant(null)}
    onUpdateStatus={updateApplicantStatus}
    getInitials={getInitials}
  />
)}

      {/* ORGANISATION PROFILE PAGE */}
      {showProfile && (
        <div
          className="modal-backdrop profile-page-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowProfile(false);
            }
          }}
        >
          <section
            className="organisation-profile-page"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employer-profile-title"
          >
            {/* LEFT PROFILE CARD */}
            <aside className="organisation-profile-sidebar">
              <button
                type="button"
                className="organisation-profile-close"
                aria-label="Close profile"
                onClick={() => setShowProfile(false)}
              >
                ×
              </button>

              <div className="organisation-profile-avatar">
                {profile.picture ? (
                  <img
                    src={profile.picture}
                    alt="Organisation profile"
                  />
                ) : (
                  <span>
                    {getInitials(profile.companyName)}
                  </span>
                )}
              </div>

              <h2>{profile.companyName}</h2>

              <p className="organisation-profile-email">
                {profile.email || "Add your work email"}
              </p>

              <span className="organisation-verified">
                Verified
              </span>

              <div className="organisation-picture-upload">
                <label htmlFor="organisation-picture">
                  Add organisation / profile photo
                </label>

                <input
                  id="organisation-picture"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicture}
                />

                <p>
                  Choose a profile image (JPG, PNG or similar).
                  The image will appear here so you can check it
                  before leaving this page.
                </p>

                {profile.picture && (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() =>
                      updateProfileField("picture", "")
                    }
                  >
                    Remove picture
                  </button>
                )}
              </div>
            </aside>

            {/* RIGHT PROFILE FORM */}
            <div className="organisation-profile-main">
              <h1 id="employer-profile-title">
                Organisation profile
              </h1>

              <form onSubmit={saveEmployerProfile}>
                <div className="organisation-form-grid">
                  <label className="organisation-field">
                    <span>Organisation name *</span>

                    <input
                      type="text"
                      required
                      value={profile.companyName}
                      onChange={(event) =>
                        updateProfileField(
                          "companyName",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label className="organisation-field">
                    <span>Contact person's name *</span>

                    <input
                      type="text"
                      required
                      value={profile.contactPerson}
                      onChange={(event) =>
                        updateProfileField(
                          "contactPerson",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label className="organisation-field">
                    <span>Work email *</span>

                    <input
                      type="email"
                      required
                      value={profile.email}
                      onChange={(event) =>
                        updateProfileField(
                          "email",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label className="organisation-field">
                    <span>Phone</span>

                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(event) =>
                        updateProfileField(
                          "phone",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label className="organisation-field">
                    <span>Industry</span>

                    <input
                      type="text"
                      value={profile.industry}
                      onChange={(event) =>
                        updateProfileField(
                          "industry",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label className="organisation-field">
                    <span>Website</span>

                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={profile.website}
                      onChange={(event) =>
                        updateProfileField(
                          "website",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label className="organisation-field organisation-field-full">
                    <span>Business address</span>

                    <input
                      type="text"
                      value={profile.location}
                      onChange={(event) =>
                        updateProfileField(
                          "location",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label className="organisation-field organisation-field-full">
                    <span>Company overview</span>

                    <textarea
                      rows={4}
                      value={profile.overview}
                      onChange={(event) =>
                        updateProfileField(
                          "overview",
                          event.target.value
                        )
                      }
                    />
                  </label>
                </div>

                <div className="organisation-profile-actions">
                  <button
                    type="submit"
                    className="organisation-save-button"
                  >
                    Save profile
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}