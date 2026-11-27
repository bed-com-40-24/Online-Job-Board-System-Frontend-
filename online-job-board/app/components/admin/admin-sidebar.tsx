import Link from "next/link";
import {
  Activity,
  Building2,
  ClipboardCheck,
  LayoutDashboard,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

const navigation = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard", section: "dashboard", backendOnly: false },
  { href: "/admin/employers", icon: Building2, label: "Employer management", section: "employers", backendOnly: false },
  { href: "/admin/verification", icon: ShieldCheck, label: "Employer verification", section: "verification", backendOnly: false },
  { href: "/admin/activity", icon: Activity, label: "Activity monitoring", section: "activity", backendOnly: false },
  { href: "/admin/profile", icon: UserRound, label: "My profile", section: "profile", backendOnly: false },
  {
    href: "/admin/employers#employer-requests",
    icon: ClipboardCheck,
    label: "Employer requests",
    section: "employers",
    backendOnly: true,
  },
  {
    href: "/admin/employers#platform-accounts",
    icon: UsersRound,
    label: "Employer accounts",
    section: "accounts",
    backendOnly: true,
  },
] as const;

type AdminSection = (typeof navigation)[number]["section"];

type AdminSidebarProps = {
  fullName: string;
  currentSection: AdminSection;
  backendMode: boolean;
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export default function AdminSidebar({ fullName, currentSection, backendMode }: AdminSidebarProps) {
  const visibleNavigation = navigation.filter((item) =>
    backendMode ? item.backendOnly || item.section === "dashboard" : !item.backendOnly,
  );
  const accountIdentity = (
    <>
      <span className="admin-sidebar-avatar" aria-hidden="true">{initials(fullName)}</span>
      <span className="admin-sidebar-account-copy">
        <strong>{fullName}</strong>
        <span>Administrator</span>
      </span>
    </>
  );

  return (
    <aside className="admin-sidebar">
      {backendMode ? (
        <div className="admin-sidebar-account">{accountIdentity}</div>
      ) : (
        <Link className="admin-sidebar-account" href="/admin/profile">{accountIdentity}</Link>
      )}
      <p className="admin-sidebar-label">ADMINISTRATOR WORKSPACE</p>
      <nav className="admin-sidebar-nav" aria-label="Administrator workspace">
        {visibleNavigation.map((item) => {
          const Icon = item.icon;
          const isCurrent = item.section === currentSection;
          return (
            <Link
              aria-current={isCurrent ? "page" : undefined}
              aria-label={item.label}
              className={`admin-sidebar-link${isCurrent ? " is-current" : ""}`}
              href={item.href}
              key={item.section}
            >
              <span aria-hidden="true"><Icon size={17} strokeWidth={2} /></span>
              <span className="admin-sidebar-link-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="admin-sidebar-foot">
        <span>OnlineJobBoard platform administration</span>
      </div>
    </aside>
  );
}
