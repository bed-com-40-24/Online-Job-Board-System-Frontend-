"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore, type AdminActivity } from "@/lib/store";

type ActivityRow = AdminActivity;

function formatActivityTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  const time = new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
  const ageInDays = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86_400_000);
  if (ageInDays === 0) return `Today, ${time}`;
  if (ageInDays === 1) return `Yesterday, ${time}`;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function AdminActivityMonitor() {
  const { adminActivity, employers, jobs, myApplicants } = useStore();
  const [fallbackTimestamp, setFallbackTimestamp] = useState<number | null>(null);

  const fallbackActivity = useMemo(() => {
    if (fallbackTimestamp === null) return [];

    const now = fallbackTimestamp;
    const events: ActivityRow[] = [];
    const reviewJobs = jobs.filter((job) => job.status === "In review");
    const recentJob = reviewJobs[0];
    const pendingEmployer = employers.find((employer) => employer.status === "Pending verification");
    const publishedJob = jobs.find((job) => job.status === "Published");
    const shortlistedApplicant = myApplicants.find((applicant) => applicant.status === "Shortlisted");

    if (recentJob) {
      const employer = employers.find((entry) => entry.id === recentJob.owner);
      events.push({
        id: `seed-job-${recentJob.id}`,
        title: "Job posting submitted",
        detail: `${employer?.name ?? "Employer"} · ${recentJob.title}`,
        href: "/admin/jobs",
        createdAt: new Date(now - 29 * 60_000).toISOString(),
      });
    }
    if (pendingEmployer) {
      events.push({
        id: `seed-employer-${pendingEmployer.id}`,
        title: "Employer verification requested",
        detail: pendingEmployer.name,
        href: "/admin/verification",
        createdAt: new Date(now - 65 * 60_000).toISOString(),
      });
    }
    if (publishedJob) {
      events.push({
        id: `seed-published-${publishedJob.id}`,
        title: "Job posting approved",
        detail: publishedJob.title,
        href: "/admin/jobs",
        createdAt: new Date(now - 24 * 60 * 60_000 + 20 * 60_000).toISOString(),
      });
    } else if (reviewJobs[1]) {
      const otherJob = reviewJobs[1];
      const employer = employers.find((entry) => entry.id === otherJob.owner);
      events.push({
        id: `seed-job-${otherJob.id}`,
        title: "Job posting submitted",
        detail: `${employer?.name ?? "Employer"} · ${otherJob.title}`,
        href: "/admin/jobs",
        createdAt: new Date(now - 24 * 60 * 60_000 + 20 * 60_000).toISOString(),
      });
    }
    if (shortlistedApplicant) {
      events.push({
        id: `seed-applicant-${shortlistedApplicant.id}`,
        title: "Applicant shortlisted",
        detail: shortlistedApplicant.name,
        href: "/admin/applications",
        createdAt: new Date(now - 24 * 60 * 60_000 + 65 * 60_000).toISOString(),
      });
    }
    return events;
  }, [employers, fallbackTimestamp, jobs, myApplicants]);

  useEffect(() => {
    const timer = window.setTimeout(() => setFallbackTimestamp(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const events = [...adminActivity, ...fallbackActivity].slice(0, 12);

  return (
    <section aria-label="Recent platform activity" className="admin-activity-list-card">
      {events.length ? (
        <ol className="admin-activity-list">
          {events.map((event) => (
            <li className="admin-activity-list-item" key={event.id}>
              <strong>{event.title}</strong>
              <p>{event.detail}</p>
              <time dateTime={event.createdAt}>{formatActivityTime(event.createdAt)}</time>
            </li>
          ))}
        </ol>
      ) : <p className="admin-empty-state">No activity has been recorded yet.</p>}
      <p className="admin-activity-list-footnote">This list shows recent activity across the platform.</p>
    </section>
  );
}
