"use client";

import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import AdminLogoutButton from "@/app/components/admin/admin-logout-button";

export function AdminDashboardMenuButton() {
  return (
    <button
      aria-label="Toggle administrator navigation"
      className="admin-menu-button"
      onClick={() => document.querySelector(".admin-workspace")?.classList.toggle("admin-navigation-collapsed")}
      title="Toggle navigation"
      type="button"
    >
      <Menu aria-hidden="true" size={20} />
    </button>
  );
}

export default function AdminDashboardHeaderTools({ fullName }: { fullName: string }) {
  const { employers, jobs } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [seen, setSeen] = useState<string[]>([]);

  const notifications = [
    ...jobs.filter((job) => job.status === "In review").map((job) => ({
      id: `job:${job.id}`,
      title: "Job awaiting review",
      detail: `${job.title} (${job.id}) is in the moderation queue.`,
      href: "/admin/jobs",
    })),
    ...employers.filter((employer) => employer.status === "Pending verification").map((employer) => ({
      id: `employer:${employer.id}`,
      title: "Employer verification pending",
      detail: `${employer.name} is waiting for verification.`,
      href: "/admin/verification",
    })),
  ];
  const unread = notifications.filter((notification) => !seen.includes(notification.id));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("ojb-admin-seen-notifications");
        if (saved) setSeen(JSON.parse(saved) as string[]);
      } catch {
        setSeen([]);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Element && !event.target.closest(".admin-notification-menu")) setIsOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("click", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("click", closeOnOutsideClick);
    };
  }, [isOpen]);

  function markRead(id: string) {
    const nextSeen = [...new Set([...seen, id])];
    setSeen(nextSeen);
    try {
      window.localStorage.setItem("ojb-admin-seen-notifications", JSON.stringify(nextSeen));
    } catch {
      // The unread state still works for the current page if storage is unavailable.
    }
  }

  return (
    <div className="admin-topbar-user">
        <div className="admin-notification-menu">
          <button
            aria-expanded={isOpen}
            aria-haspopup="true"
            aria-label={unread.length ? `Notifications, ${unread.length} unread` : "Notifications"}
            className="admin-notification-button"
            onClick={() => setIsOpen((open) => !open)}
            type="button"
          >
            <Bell aria-hidden="true" size={19} />
            {unread.length > 0 && <span className="admin-notification-count">{unread.length > 99 ? "99+" : unread.length}</span>}
          </button>
          {isOpen && (
            <section aria-label="Notifications" className="admin-notification-dropdown">
              <strong>Notifications</strong>
              {unread.length ? unread.map((notification) => (
                <Link
                  className="admin-notification-item"
                  href={notification.href}
                  key={notification.id}
                  onClick={() => {
                    markRead(notification.id);
                    setIsOpen(false);
                  }}
                >
                  <strong>{notification.title}</strong>
                  <span>{notification.detail}</span>
                  <em>Review now</em>
                </Link>
              )) : <p className="admin-notification-empty">You have no current notifications.</p>}
            </section>
          )}
        </div>
        <div className="admin-topbar-identity"><strong>{fullName}</strong><span>Administrator</span></div>
        <AdminLogoutButton />
    </div>
  );
}
