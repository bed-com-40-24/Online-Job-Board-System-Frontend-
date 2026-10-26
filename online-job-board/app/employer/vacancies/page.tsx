"use client";

import Link from "next/link";
import { useState } from "react";

type Vacancy = {
  id: number;
  title: string;
  location: string;
  status: string;
};

const demoVacancies: Vacancy[] = [
  { id: 1, title: "Software Engineer", location: "Lilongwe", status: "Published" },
  { id: 2, title: "Frontend Developer", location: "Blantyre", status: "Closed" },
];

export default function VacanciesPage() {
  const [vacancies] = useState<Vacancy[]>(demoVacancies);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/20 bg-[#0b1f39] px-5 py-7 text-[#edf4ff] md:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#315be8] text-lg font-bold text-white">J</div>
            <div>
              <p className="font-bold leading-tight text-white">JobBoard</p>
              <p className="mt-1 text-xs text-[#d6e0ef]">Employer workspace</p>
            </div>
          </div>

          <nav aria-label="Employer navigation" className="space-y-1">
            <Link href="/" className="block rounded-lg px-3 py-2.5 text-sm text-[#d6e0ef] hover:bg-white/10">Dashboard</Link>
            <Link href="/employer/vacancies" aria-current="page" className="block rounded-lg bg-[#16335f] px-3 py-2.5 text-sm font-semibold text-white">My vacancies</Link>
            <Link href="/employer/vacancies/new" className="block rounded-lg px-3 py-2.5 text-sm text-[#d6e0ef] hover:bg-white/10">Create vacancy</Link>
            <Link href="/admin/employers" className="block rounded-lg px-3 py-2.5 text-sm text-[#d6e0ef] hover:bg-white/10">Employer management</Link>
          </nav>

          <div className="mt-10 rounded-xl border border-white/15 bg-white/10 p-4">
            <p className="text-sm font-semibold text-white">Employer</p>
            <p className="mt-1 break-all text-xs text-[#d6e0ef]">recruiter@onlinejobboard.mw</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/20 bg-[#0b1f39] px-4 py-3 text-[#edf4ff] sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-[#315be8] bg-[#315be8] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#274fe0]">
                <span aria-hidden="true" className="text-base">←</span>
                Back to home
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden h-9 w-px bg-slate-200 sm:block" />
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">E</div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-white">Employer</p>
                  <p className="text-xs text-[#d6e0ef]">recruiter@onlinejobboard.mw</p>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <p className="text-sm font-medium text-blue-700">Employer Workspace / Vacancies</p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">My vacancies</h1>
              <p className="mt-2 text-gray-600">Manage your job vacancies. Click "Create vacancy" to add a new posting.</p>
            </div>

            <div className="space-y-4">
              {vacancies.map((v) => (
                <div key={v.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{v.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{v.location}</p>
                    </div>
                    <div className="text-sm text-gray-500">{v.status}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Link href="/employer/vacancies/new" className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">+ Create vacancy</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}