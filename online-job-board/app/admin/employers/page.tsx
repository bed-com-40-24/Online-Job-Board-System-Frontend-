"use client";

import { useMemo, useState } from "react";

type EmployerStatus = "Pending verification" | "Verified" | "Rejected";

type Employer = {
  id: number;
  company: string;
  email: string;
  industry: string;
  jobs: number;
  status: EmployerStatus;
};

const initialEmployers: Employer[] = [
  {
    id: 1,
    company: "Copperline Digital",
    email: "hello@copperline.mw",
    industry: "Information Technology",
    jobs: 2,
    status: "Pending verification",
  },
  {
    id: 2,
    company: "Greenfields Agriculture",
    email: "careers@greenfields.mw",
    industry: "Agriculture",
    jobs: 4,
    status: "Verified",
  },
  {
    id: 3,
    company: "Lakeview Health Services",
    email: "jobs@lakeview.mw",
    industry: "Healthcare",
    jobs: 3,
    status: "Pending verification",
  },
  {
    id: 4,
    company: "Mwezi Retail Group",
    email: "hr@mwezi.mw",
    industry: "Retail",
    jobs: 1,
    status: "Rejected",
  },
];

export default function EmployerManagementPage() {
  const [employers, setEmployers] = useState<Employer[]>(initialEmployers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [message, setMessage] = useState("");
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredEmployers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employers.filter((employer) => {
      const matchesSearch = [
        employer.company,
        employer.email,
        employer.industry,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const matchesFilter =
        filter === "All statuses" || employer.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [employers, search, filter]);

  function updateStatus(id: number, status: EmployerStatus) {
    const employer = employers.find((item) => item.id === id);
    if (!employer) return;

    const action = status === "Verified" ? "approve" : "reject";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${employer.company}?`,
    );

    if (!confirmed) return;

    setEmployers((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    setMessage(
      `${employer.company} has been ${
        status === "Verified" ? "approved" : "rejected"
      }.`,
    );
  }

  function viewEmployer(employer: Employer) {
    setMessage(
      `${employer.company} · ${employer.email} · ${employer.industry} · ${employer.jobs} job(s) · ${employer.status}`,
    );
  }

  function statusStyle(status: EmployerStatus) {
    if (status === "Verified") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    if (status === "Rejected") return "bg-rose-50 text-rose-700 ring-rose-200";
    return "bg-amber-50 text-amber-800 ring-amber-200";
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/20 bg-[#0b1f39] px-4 py-3 text-[#edf4ff] sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={showMobileNav}
              onClick={() => setShowMobileNav((open) => !open)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/30 text-xl text-white hover:bg-white/10 md:hidden"
            >
              ☰
            </button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#315be8] text-lg font-bold text-white md:hidden">
              J
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold leading-tight text-white">JobBoard</p>
              <p className="mt-1 hidden text-xs text-[#d6e0ef] sm:block">Administrator portal</p>
            </div>
          </div>

          <div className="hidden max-w-md flex-1 px-6 md:block">
            <label className="relative block">
              <span className="sr-only">Search employers</span>
              <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
              <input
                type="search"
                placeholder="Search employers..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={showNotifications}
              onClick={() => setShowNotifications((open) => !open)}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-lg text-white hover:bg-white/20"
            >
              🔔
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
            </button>
            <div className="hidden h-9 w-px bg-slate-200 sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">A</div>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-white">Administrator</p>
                <p className="text-xs text-[#d6e0ef]">admin@onlinejobboard.mw</p>
              </div>
            </div>
          </div>

          {showNotifications && (
            <div className="absolute right-4 top-[calc(100%-4px)] z-30 w-72 rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-lg sm:right-6">
              <p className="font-semibold text-slate-900">Notifications</p>
              <p className="mt-2 text-sm text-slate-600">You have {employers.filter((employer) => employer.status === "Pending verification").length} employer(s) waiting for verification.</p>
              <button type="button" onClick={() => setShowNotifications(false)} className="mt-3 text-sm font-semibold text-blue-700 hover:underline">Close</button>
            </div>
          )}
        </header>

        {showMobileNav && (
          <nav aria-label="Mobile administrator navigation" className="border-b border-slate-200 bg-white p-3 md:hidden">
            <a href="/admin" className="block rounded-lg px-3 py-2.5 text-sm text-[#d6e0ef] hover:bg-white/10">Dashboard</a>
            <a href="/admin/employers" aria-current="page" className="block rounded-lg bg-white/15 px-3 py-2.5 text-sm font-semibold text-white">Employer management</a>
            <a href="/admin/employer-verification" className="block rounded-lg px-3 py-2.5 text-sm text-[#d6e0ef] hover:bg-white/10">Employer verification</a>
            <a href="/admin/job-moderation" className="block rounded-lg px-3 py-2.5 text-sm text-[#d6e0ef] hover:bg-white/10">Job moderation</a>
            <a href="/admin/activity" className="block rounded-lg px-3 py-2.5 text-sm text-[#d6e0ef] hover:bg-white/10">Activity monitoring</a>
            <a href="/admin/profile" className="block rounded-lg px-3 py-2.5 text-sm text-[#d6e0ef] hover:bg-white/10">My profile</a>
          </nav>
        )}

        <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-white/20 bg-[#0b1f39] px-5 py-7 text-[#edf4ff] md:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#315be8] text-lg font-bold text-white">
              J
            </div>
            <div>
              <p className="font-bold leading-tight text-white">JobBoard</p>
              <p className="mt-1 text-xs text-[#d6e0ef]">Admin workspace</p>
            </div>
          </div>

          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#aabbd0]">
            Workspace
          </p>
          <nav aria-label="Administrator navigation" className="space-y-1">
            <a
              href="/admin"
              className="block rounded-lg px-3 py-2.5 text-sm text-[#d6e0ef] hover:bg-white/10"
            >
              Dashboard
            </a>
            <a
              href="/admin/employers"
              aria-current="page"
              className="block rounded-lg bg-[#16335f] px-3 py-2.5 text-sm font-semibold text-white"
            >
              Employer management
            </a>
            <a
              href="/admin/employer-verification"
              className="block rounded-lg px-3 py-2.5 text-sm text-[#d6e0ef] hover:bg-white/10"
            >
              Employer verification
            </a>
            <a
              href="/admin/job-moderation"
              className="block rounded-lg px-3 py-2.5 text-sm text-[#d6e0ef] hover:bg-white/10"
            >
              Job moderation
            </a>
            <a
              href="/admin/activity"
              className="block rounded-lg px-3 py-2.5 text-sm text-[#d6e0ef] hover:bg-white/10"
            >
              Activity monitoring
            </a>
            <a
              href="/admin/profile"
              className="block rounded-lg px-3 py-2.5 text-sm text-[#d6e0ef] hover:bg-white/10"
            >
              My profile
            </a>
          </nav>

          <div className="mt-10 rounded-xl border border-white/15 bg-white/10 p-4">
            <p className="text-sm font-semibold text-white">Administrator</p>
            <p className="mt-1 break-all text-xs text-[#d6e0ef]">
              admin@onlinejobboard.mw
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          <header className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Administrator workspace
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="/admin"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <span aria-hidden="true">←</span>
                Back to dashboard
              </a>
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Employer management
            </h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              View registered employers and their statuses.
            </p>
          </header>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-semibold">Registered employers</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Search and manage registered organisations.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-2xl">
                  <label className="min-w-0 flex-1">
                    <span className="sr-only">Search employers</span>
                    <input
                      type="search"
                      placeholder="Search by organisation name, business email or industry"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>

                  <label className="sm:w-52">
                    <span className="sr-only">Filter by status</span>
                    <select
                      value={filter}
                      onChange={(event) => setFilter(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    >
                      <option>All statuses</option>
                      <option>Pending verification</option>
                      <option>Verified</option>
                      <option>Rejected</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            {message && (
              <div
                role="status"
                className="flex flex-col gap-2 border-b border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <p>{message}</p>
                <button
                  type="button"
                  onClick={() => setMessage("")}
                  className="self-start font-semibold underline underline-offset-2 sm:self-auto"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-semibold sm:px-6">
                      Employer
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Industry
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Jobs
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployers.map((employer) => (
                    <tr key={employer.id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-4 sm:px-6">
                        <p className="font-semibold text-slate-900">
                          {employer.company}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {employer.email}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {employer.industry}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {employer.jobs}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle(employer.status)}`}
                        >
                          {employer.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {employer.status === "Pending verification" ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateStatus(employer.id, "Verified")}
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus(employer.id, "Rejected")}
                              className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => viewEmployer(employer)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredEmployers.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-slate-500"
                      >
                        No employers found. Try changing your search or status
                        filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-1 border-t border-slate-200 px-4 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <span>
                Showing {filteredEmployers.length} of {employers.length} employers
              </span>
              <span>Demo data · Changes are not saved to a database</span>
            </div>
          </section>
        </section>
        </div>
      </div>
    </main>
  );
}