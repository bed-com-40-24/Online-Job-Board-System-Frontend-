import React, { useState } from "react";
import {
  Activity, ShieldCheck, Download, Trash2, RotateCcw,
  Plus, AlertTriangle, CheckCircle2, Sparkles
} from "lucide-react";
import { ErrorBoundary } from "./ErrorBoundary";
import { useActivityLog } from "./useActivityLog";
import { useToast, ToastContainer } from "./ToastNotification";
import { ActivityStatsCard } from "./ActivityStatsCard";
import { ActivityTimeline } from "./ActivityTimeline";

/**
 * Buggy Component to demonstrate Issue #28 ErrorBoundary resilience
 */
function BuggyComponent({ trigger }) {
  if (trigger) {
    throw new Error("Simulated intentional runtime exception to test ErrorBoundary recovery.");
  }
  return null;
}

/**
 * Main View for Priority 6: Quality and Operational Concerns
 * - Issue #21 (AFR09) — Implement Platform Activity Monitoring
 * - Issue #27 (NFR06) — Optimise Frontend Performance
 * - Issue #28 (NFR07) — Implement Error Handling and Reliability
 */
function Priority6Content() {
  const {
    filteredActivities,
    stats,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    logActivity,
    clearActivityLog,
    resetActivityLog,
    exportActivityLog
  } = useActivityLog();

  const { toast, showToast, hideToast } = useToast();

  const [customEventText, setCustomEventText] = useState("");
  const [customEventType, setCustomEventType] = useState("Job review");
  const [simulateError, setSimulateError] = useState(false);

  // Issue #21 (AFR09): Log new activity with feedback
  const handleCreateActivity = (e) => {
    e.preventDefault();
    if (!customEventText.trim()) {
      showToast("Please enter an activity description.", "warning");
      return;
    }
    logActivity(customEventText, customEventType);
    showToast(`Activity logged: "${customEventText.trim()}"`, "success");
    setCustomEventText("");
  };

  // Issue #28 (NFR07): Reliability export & clear actions with confirmation
  const handleExport = () => {
    const success = exportActivityLog();
    if (success) {
      showToast("Activity log exported as JSON file.", "info");
    } else {
      showToast("Failed exporting activity log.", "error");
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the platform activity log?")) {
      clearActivityLog();
      showToast("Platform activity log cleared.", "warning");
    }
  };

  const handleReset = () => {
    resetActivityLog();
    showToast("Activity log reset to demo sample state.", "success");
  };

  const handleClearSearchFilters = () => {
    setSearchQuery("");
    setSelectedType("All");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8 font-sans bg-[#f7f8fb] min-h-screen">
      <ToastContainer toast={toast} onClose={hideToast} />

      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            <Sparkles size={14} /> Priority 6 — Quality & Operations
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            Platform Activity & Reliability Suite
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Module implementing Issue #21 (AFR09), #27 (NFR06), and #28 (NFR07)
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm"
          >
            <Download size={15} />
            Export Audit Log
          </button>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm"
          >
            <RotateCcw size={15} />
            Reset Data
          </button>

          <button
            onClick={handleClear}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 shadow-sm"
          >
            <Trash2 size={15} />
            Clear Log
          </button>
        </div>
      </div>

      {/* Issue #21 (AFR09) & Issue #27 (NFR06): Metrics Summary Cards */}
      <section>
        <ActivityStatsCard stats={stats} />
      </section>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Left Column: Platform Activity Timeline */}
        <section>
          <ActivityTimeline
            activities={filteredActivities}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            onClearSearch={handleClearSearchFilters}
          />
        </section>

        {/* Right Column: Logging Simulation & Reliability Controls */}
        <div className="space-y-6">
          {/* Form: Record New Activity Event */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus size={18} className="text-indigo-600" />
              Log System Activity
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Simulate an audit event in real-time
            </p>

            <form onSubmit={handleCreateActivity} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Category
                </label>
                <select
                  value={customEventType}
                  onChange={(e) => setCustomEventType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="Job review">Job review</option>
                  <option value="Application">Application</option>
                  <option value="Employer">Employer</option>
                  <option value="System">System</option>
                  <option value="Update">Update</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Activity Description *
                </label>
                <input
                  type="text"
                  value={customEventText}
                  onChange={(e) => setCustomEventText(e.target.value)}
                  placeholder="e.g. Admin approved IT Technician vacancy"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
              >
                <CheckCircle2 size={16} />
                Record Activity Event
              </button>
            </form>
          </section>

          {/* Error Boundary Recovery Test Section */}
          <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck size={18} className="text-amber-600" />
              Reliability & Fault Tolerance Test
            </h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Issue #28 requirement testing: Trigger a deliberate runtime exception to verify that the Error Boundary safely intercepts crashes and allows UI recovery.
            </p>

            <div className="mt-4">
              <BuggyComponent trigger={simulateError} />

              <button
                onClick={() => setSimulateError(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
              >
                <AlertTriangle size={15} />
                Simulate Runtime Exception
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/**
 * Exported Priority 6 Module wrapped in Error Boundary
 */
export function Priority6Module() {
  return (
    <ErrorBoundary>
      <Priority6Content />
    </ErrorBoundary>
  );
}

export default Priority6Module;
