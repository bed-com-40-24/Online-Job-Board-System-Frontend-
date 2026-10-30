import React from "react";
import { Activity, Search, Filter, BriefcaseBusiness, Users, Building2, Shield, RefreshCw } from "lucide-react";
import { EmptyState } from "./EmptyState";

function getEventIcon(type) {
  switch (type) {
    case "Job review":
      return <BriefcaseBusiness size={17} className="text-amber-600" />;
    case "Application":
      return <Users size={17} className="text-emerald-600" />;
    case "Employer":
      return <Building2 size={17} className="text-violet-600" />;
    case "System":
      return <Shield size={17} className="text-indigo-600" />;
    default:
      return <Activity size={17} className="text-slate-600" />;
  }
}

function getBadgeStyle(type) {
  switch (type) {
    case "Job review":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    case "Application":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "Employer":
      return "bg-violet-50 text-violet-700 ring-violet-600/20";
    case "System":
      return "bg-indigo-50 text-indigo-700 ring-indigo-600/20";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-500/20";
  }
}

/**
 * Issue #21 (AFR09) — Interactive Platform Activity Timeline
 * Issue #27 (NFR06) — Optimized rendering with search & category filters
 */
export function ActivityTimeline({
  activities,
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  onClearSearch
}) {
  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600" />
            Audit Activity Timeline
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Real-time activity events logged in local browser memory
          </p>
        </div>

        {/* Issue #27 (NFR06) - Optimized Filter & Search Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search event logs..."
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <Filter size={14} className="ml-2 text-slate-400" />
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="rounded-lg bg-transparent px-2 py-1 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="All">All Events</option>
              <option value="Job review">Job reviews</option>
              <option value="Application">Applications</option>
              <option value="Employer">Employers</option>
              <option value="System">System</option>
              <option value="Update">Updates</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Timeline List */}
      {activities.length > 0 ? (
        <div className="relative space-y-6 pl-2">
          {activities.map((item, index) => (
            <div key={item.id} className="relative flex gap-4">
              {/* Timeline Connector */}
              <div className="flex flex-col items-center">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                  {getEventIcon(item.type)}
                </span>
                {index < activities.length - 1 && (
                  <span className="mt-2 h-full w-0.5 bg-slate-100" />
                )}
              </div>

              {/* Activity Details */}
              <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50/40 p-4 transition hover:bg-slate-50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">
                    {item.text}
                  </p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${getBadgeStyle(item.type)}`}>
                    {item.type}
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium text-slate-400">
                  {item.time} · Recorded in system audit log
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No activity logs found"
          detail="Try adjusting your search criteria or activity filter."
          action={
            (searchQuery || selectedType !== "All") && (
              <button
                onClick={onClearSearch}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
              >
                <RefreshCw size={14} />
                Clear Filters
              </button>
            )
          }
        />
      )}
    </div>
  );
}
