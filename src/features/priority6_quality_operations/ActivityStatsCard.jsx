import React from "react";
import { Activity, ShieldCheck, BriefcaseBusiness, Users, Clock3 } from "lucide-react";

/**
 * Issue #21 (AFR09) & Issue #27 (NFR06) — Activity Monitoring Metrics Cards
 */
export function ActivityStatsCard({ stats }) {
  const cards = [
    {
      label: "Total Logged Events",
      value: stats.total,
      hint: "Platform action history",
      icon: Activity,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    {
      label: "Job Moderation Events",
      value: stats.jobReviews,
      hint: "Vacancy reviews and decisions",
      icon: BriefcaseBusiness,
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      label: "Application Events",
      value: stats.applications,
      hint: "Candidate submissions & status changes",
      icon: Users,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      label: "System & Employer Actions",
      value: stats.employers + stats.systemEvents + stats.updates,
      hint: "Registrations & system updates",
      icon: ShieldCheck,
      color: "bg-violet-50 text-violet-600 border-violet-100",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                  {card.value}
                </p>
              </div>
              <span className={`rounded-xl border p-3 ${card.color}`}>
                <IconComponent size={20} />
              </span>
            </div>
            <p className="mt-3 text-xs font-medium text-slate-500">{card.hint}</p>
          </div>
        );
      })}
    </div>
  );
}
