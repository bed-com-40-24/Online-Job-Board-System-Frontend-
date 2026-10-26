import Link from "next/link";

const navigation = [
  { href: "/admin/dashboard", icon: "▦", label: "Dashboard", section: "dashboard" },
  { href: "/admin/employers", icon: "♧", label: "Employer management", section: "employers" },
  { href: "/admin/verification", icon: "✓", label: "Employer verification", section: "verification" },
  { href: "/admin/moderation", icon: "▤", label: "Job moderation", section: "moderation" },
  { href: "/admin/activity", icon: "◷", label: "Activity monitoring", section: "activity" },
  { href: "/admin/profile", icon: "◉", label: "My profile", section: "profile" },
] as const;

type AdminSidebarProps = {
  fullName: string;
  currentSection: (typeof navigation)[number]["section"];
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export default function AdminSidebar({ fullName, currentSection }: AdminSidebarProps) {
  const dashboardOnly = currentSection === "dashboard";
  const visibleNavigation = navigation.filter(
    (item) => !dashboardOnly || item.section === "dashboard",
  );

  return (
    <aside className="admin-sidebar">
      {!dashboardOnly && (
        <>
          <Link className="admin-sidebar-account" href="/admin/profile">
            <span className="admin-sidebar-avatar" aria-hidden="true">{initials(fullName)}</span>
            <span className="admin-sidebar-account-copy">
              <strong>{fullName}</strong>
              <span>Administrator</span>
            </span>
          </Link>
          <p className="admin-sidebar-label">ADMINISTRATOR WORKSPACE</p>
        </>
      )}
      <nav className="admin-sidebar-nav" aria-label="Administrator workspace">
        {visibleNavigation.map((item) => (
          <Link
            aria-current={item.section === currentSection ? "page" : undefined}
            className={`admin-sidebar-link${item.section === currentSection ? " is-current" : ""}`}
            href={item.href}
            key={item.section}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      {!dashboardOnly && (
        <p className="admin-sidebar-foot">OnlineJobBoard platform administration</p>
      )}
    </aside>
  );
}
