"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewVacancyPage() {
const [message, setMessage] = useState("");

function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
event.preventDefault();

const form = event.currentTarget;

if (!form.checkValidity()) {
  form.reportValidity();
  return;
}

setMessage("Your job vacancy form has been submitted successfully!");
form.reset();

}

return (
<main className="min-h-screen bg-slate-100 text-slate-900">
<div className="flex min-h-screen">
  <aside className="hidden w-64 shrink-0 border-r border-white/20 bg-[#0b1f39] px-5 py-7 text-[#edf4ff] md:block">
    <div className="mb-10 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#315be8] text-lg font-bold text-white">
        J
      </div>
      <div>
        <p className="font-bold leading-tight text-white">JobBoard</p>
        <p className="mt-1 text-xs text-[#d6e0ef]">Employer workspace</p>
      </div>
    </div>

    <nav aria-label="Employer navigation" className="space-y-1">
      <Link href="/" className="block rounded-lg px-3 py-2.5 text-sm text-[#d6e0ef] hover:bg-white/10">
        Dashboard
      </Link>
      <Link href="/employer/vacancies" className="block rounded-lg px-3 py-2.5 text-sm text-[#d6e0ef] hover:bg-white/10">
        My vacancies
      </Link>
      <Link href="/employer/vacancies/new" aria-current="page" className="block rounded-lg bg-[#16335f] px-3 py-2.5 text-sm font-semibold text-white">
        Create vacancy
      </Link>
      <Link href="/admin/employers" className="block rounded-lg px-3 py-2.5 text-sm text-[#d6e0ef] hover:bg-white/10">
        Employer management
      </Link>
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
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            E
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-white">Employer</p>
            <p className="text-xs text-[#d6e0ef]">recruiter@onlinejobboard.mw</p>
          </div>
        </div>
      </div>
    </header>

    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-700">Employer Workspace / Vacancies / Create</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Create Job Vacancy</h1>
        <p className="mt-2 text-gray-600">Enter the details below to create a job vacancy.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Job Information</h2>
          <p className="mt-1 text-sm text-gray-500">Fields marked with * are required.</p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="jobTitle" className="mb-2 block text-sm font-medium text-gray-700">Job Title *</label>
              <input id="jobTitle" name="jobTitle" required placeholder="e.g. Software Developer" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            </div>

            <div>
              <label htmlFor="companyName" className="mb-2 block text-sm font-medium text-gray-700">Company Name *</label>
              <input id="companyName" name="companyName" required className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            </div>

            <div>
              <label htmlFor="location" className="mb-2 block text-sm font-medium text-gray-700">Location *</label>
              <input id="location" name="location" required placeholder="e.g. Zomba" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            </div>

            <div>
              <label htmlFor="employmentType" className="mb-2 block text-sm font-medium text-gray-700">Employment Type *</label>
              <select id="employmentType" name="employmentType" required defaultValue="" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                <option value="" disabled>Select type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Job Description and Requirements</h2>

          <div className="mt-5 space-y-5">
            <div>
              <label htmlFor="jobCategory" className="mb-2 block text-sm font-medium text-gray-700">Job Category *</label>
              <input id="jobCategory" name="jobCategory" required placeholder="e.g. Information Technology" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            </div>

            <div>
              <label htmlFor="salary" className="mb-2 block text-sm font-medium text-gray-700">Salary (optional)</label>
              <input id="salary" name="salary" type="number" min="0" placeholder="Enter salary" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            </div>

            <div>
              <label htmlFor="applicationDeadline" className="mb-2 block text-sm font-medium text-gray-700">Application Deadline *</label>
              <input id="applicationDeadline" name="applicationDeadline" type="date" required min={new Date().toLocaleDateString("en-CA")} className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            </div>

            <div>
              <label htmlFor="jobDescription" className="mb-2 block text-sm font-medium text-gray-700">Job Description *</label>
              <textarea id="jobDescription" name="jobDescription" required rows={4} placeholder="Describe the job responsibilities..." className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            </div>

            <div>
              <label htmlFor="qualifications" className="mb-2 block text-sm font-medium text-gray-700">Qualifications *</label>
              <textarea id="qualifications" name="qualifications" required rows={3} placeholder="Enter the required qualifications..." className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            </div>
          </div>
        </section>

        {message && (
          <p role="status" className="rounded-lg bg-green-100 p-3 text-green-800">{message}</p>
        )}

        <button type="submit" className="w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800">
          Create Vacancy
        </button>
      </form>
    </div>
  </section>
</div>
</main>
);
}