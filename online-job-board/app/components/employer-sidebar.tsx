import Link from "next/link";

const navigation = [
  { href: "/employer/dashboard", icon: "▦", label: "Dashboard", section: "dashboard" },
  { href: "/employer/vacancies", icon: "▤", label: "My vacancies", section: "vacancies" },
  { href: "/employer/vacancies", icon: "＋", label: "Create vacancy", section: "create" },
  { href: "/employer/applications", icon: "☷", label: "Applications", section: "applications" },
  { href: "/employer/applicants", icon: "♙", label: "Applicant management", section: "applicants" },
  { href: "/employer/profile", icon: "◉", label: "My profile", section: "profile" },
] as const;

type EmployerSidebarProps = {
  companyName: string;
  currentSection: (typeof navigation)[number]["section"];
};

function initials(companyName: string) {
  return companyName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export default function EmployerSidebar({ companyName, currentSection }: EmployerSidebarProps) {
  const dashboardOnly = currentSection === "dashboard";
  const visibleNavigation = navigation.filter(
    (item) => !dashboardOnly || item.section === "dashboard",
  );

  return (
    <aside className="employer-dashboard-sidebar">
      {!dashboardOnly && (
        <>
          <Link className="employer-sidebar-company" href="/employer/profile">
            <span className="employer-sidebar-avatar" aria-hidden="true">{initials(companyName)}</span>
            <span className="employer-sidebar-company-copy">
              <strong>{companyName}</strong>
              <span>Employer</span>
            </span>
          </Link>
          <p className="employer-sidebar-label">EMPLOYER WORKSPACE</p>
        </>
      )}
      <nav className="employer-dashboard-nav" aria-label="Employer workspace">
        {visibleNavigation.map((item) => (
          <Link
            aria-current={item.section === currentSection ? "page" : undefined}
            className={item.section === currentSection ? "is-current" : undefined}
            href={item.href}
            key={item.section}
          >
            <span aria-hidden="true">{item.icon}</span> {item.label}
          </Link>
        ))}
      </nav>
      {!dashboardOnly && (
        <p className="employer-sidebar-foot">Connecting employers with the right talent.</p>
      )}
    </aside>
  );
}
