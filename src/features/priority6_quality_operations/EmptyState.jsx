import React from "react";
import { ClipboardList } from "lucide-react";

/**
 * Issue #28 (NFR07) — Reusable Fallback Component for Empty States
 */
export function EmptyState({ title = "Nothing to display", detail = "No records found matching your current filter.", icon: Icon = ClipboardList, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
      <span className="rounded-2xl bg-white p-4 text-slate-400 shadow-sm border border-slate-100">
        <Icon size={28} />
      </span>
      <h3 className="mt-4 font-bold text-slate-800 text-base">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 leading-relaxed">{detail}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
