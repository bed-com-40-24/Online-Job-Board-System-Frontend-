"use client";

import { useEffect, useState } from "react";
import { Bell, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { EMP_ID } from "@/lib/data";
import { useStore } from "@/lib/store";

type DashboardNotification = { id: string; title: string; detail: string; action: string; href: string };

export default function EmployerDashboardHeaderTools({ part }: { part: "sidebar" | "notifications" }) {
  const router = useRouter();
  const { jobs, myApplicants } = useStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [seen, setSeen] = useState<string[]>([]);
  const employerJobs = jobs.filter((job) => job.owner === EMP_ID);
  const notifications: DashboardNotification[] = [
    ...myApplicants
      .filter((applicant) => applicant.status === "Pending" || applicant.status === "New")
      .map((applicant) => ({
        id: `applicant:${applicant.id}`,
        title: "New applicant",
        detail: `${applicant.name} has applied for ${applicant.job}.`,
        action: "View applications",
        href: "/employer/applications",
      })),
    ...employerJobs
      .filter((job) => job.status === "In review" || job.status === "Published")
      .map((job) => ({
        id: `vacancy:${job.id}:${job.status}`,
        title: job.status === "In review" ? "Vacancy awaiting review" : "Vacancy published",
        detail: job.status === "In review"
          ? `${job.title} has been submitted and is awaiting moderation.`
          : `${job.title} is now published and visible to candidates.`,
        action: "View vacancy",
        href: "/employer/vacancies",
      })),
  ];
  const unread = notifications.filter((notification) => !seen.includes(notification.id));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem("ojb-employer-seen-notifications");
        if (stored) setSeen(JSON.parse(stored) as string[]);
      } catch {
        setSeen([]);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Element && !event.target.closest(".employer-notification-menu")) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("click", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("click", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  function toggleSidebar() {
    const dashboard = document.querySelector(".employer-dashboard-home");
    if (!dashboard) return;
    const nextCollapsed = !sidebarCollapsed;
    dashboard.classList.toggle("sidebar-collapsed", nextCollapsed);
    setSidebarCollapsed(nextCollapsed);
  }

  function openNotification(notification: DashboardNotification) {
    const nextSeen = [...new Set([...seen, notification.id])];
    setSeen(nextSeen);
    try {
      window.localStorage.setItem("ojb-employer-seen-notifications", JSON.stringify(nextSeen));
    } catch {
      // Notifications remain usable for this visit if browser storage is unavailable.
    }
    setIsOpen(false);
    router.push(notification.href);
  }

  if (part === "sidebar") {
    return (
      <button
        className="employer-sidebar-toggle"
        type="button"
        aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
        aria-controls="employer-dashboard-sidebar"
        aria-expanded={!sidebarCollapsed}
        title={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
        onClick={toggleSidebar}
      >
        <Menu aria-hidden="true" size={20} />
      </button>
    );
  }

  return (
    <>
      <div className="employer-notification-menu">
        <button
          className="header-icon-button"
          type="button"
          aria-label={unread.length ? `Notifications, ${unread.length} unread` : "Notifications"}
          aria-haspopup="true"
          aria-expanded={isOpen}
          title={unread.length ? `${unread.length} unread notification${unread.length === 1 ? "" : "s"}` : "Notifications"}
          onClick={() => setIsOpen((open) => !open)}
        >
          <Bell aria-hidden="true" size={20} />
          {unread.length > 0 && <span className="notification-badge">{unread.length > 99 ? "99+" : unread.length}</span>}
        </button>
        {isOpen && (
          <section className="notification-dropdown" aria-label="Notifications">
            <strong>Notifications</strong>
            {unread.length ? (
              <div className="notification-list">
                {unread.map((notification) => (
                  <button
                    className="notification-item"
                    key={notification.id}
                    onClick={() => openNotification(notification)}
                    type="button"
                  >
                    <strong>{notification.title}</strong>
                    <span>{notification.detail}</span>
                    <em>Read notification - {notification.action}</em>
                  </button>
                ))}
              </div>
            ) : (
              <p className="notification-empty">You have no current notifications.</p>
            )}
          </section>
        )}
      </div>
    </>
  );
}
