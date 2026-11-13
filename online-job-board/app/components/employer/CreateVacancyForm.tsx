"use client";

import { useState, type FormEvent } from "react";
import { EMP_ID } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function CreateVacancyForm({ jobId }: { jobId?: string }) {
  const { jobs, createEmployerJob, updateEmployerJob } = useStore();
  const existingJob = jobs.find((job) => job.id === jobId && job.owner === EMP_ID);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (jobId && !existingJob) {
    return <p className="notice" role="status">This vacancy could not be found in your account.</p>;
  }

  if (existingJob?.status === "Closed") {
    return <p className="notice" role="status">This vacancy is closed and can no longer be edited or submitted.</p>;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setIsSaving(true);

    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const intent = submitter instanceof HTMLButtonElement ? submitter.value : "draft";
    const fields = new FormData(form);
    const job = {
      title: String(fields.get("title") ?? "").trim(),
      dept: String(fields.get("dept") ?? ""),
      type: String(fields.get("type") ?? ""),
      loc: String(fields.get("loc") ?? "").trim(),
      deadline: String(fields.get("deadline") ?? ""),
      openings: Number(fields.get("openings") || 1),
      description: String(fields.get("description") ?? "").trim(),
      requirements: String(fields.get("requirements") ?? "").trim(),
    };
    const saved = existingJob
      ? updateEmployerJob(existingJob.id, job)
      : createEmployerJob(job, intent === "submit" ? "In review" : "Draft");

    if (!saved) {
      setMessage("The vacancy could not be saved. Please try again.");
      setIsSaving(false);
      return;
    }

    setMessage(existingJob
      ? "Vacancy details updated without creating another submission."
      : intent === "submit" ? "Vacancy submitted for review." : "Vacancy saved as draft.");
    if (!existingJob) form.reset();
    setIsSaving(false);
  }

  return (
    <form className="panel create-vacancy-form" onSubmit={handleSubmit}>
      <div className="formgrid">
        <div className="field">
          <label htmlFor="vacancy-title">Job title *</label>
          <input id="vacancy-title" name="title" required minLength={3} defaultValue={existingJob?.title} placeholder="Frontend Developer" />
        </div>
        <div className="field">
          <label htmlFor="vacancy-department">Department *</label>
          <select id="vacancy-department" name="dept" required defaultValue={existingJob?.dept || "Engineering"}>
            {['Engineering', 'Product', 'Operations', 'Analytics', 'Human Resources', 'Finance', 'Other'].map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="vacancy-type">Employment type *</label>
          <select id="vacancy-type" name="type" required defaultValue={existingJob?.type || "Full-time"}>
            {['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="vacancy-location">Location *</label>
          <input id="vacancy-location" name="loc" required defaultValue={existingJob?.loc} placeholder="Lilongwe, Malawi" />
        </div>
        <div className="field">
          <label htmlFor="vacancy-deadline">Application deadline *</label>
          <input id="vacancy-deadline" name="deadline" type="date" required defaultValue={existingJob?.deadline} />
        </div>
        <div className="field">
          <label htmlFor="vacancy-openings">Number of openings</label>
          <input id="vacancy-openings" name="openings" type="number" min={1} defaultValue={existingJob?.openings || 1} />
        </div>
        <div className="field wide">
          <label htmlFor="vacancy-description">Job description *</label>
          <textarea id="vacancy-description" name="description" required minLength={20} defaultValue={existingJob?.description} />
        </div>
        <div className="field wide">
          <label htmlFor="vacancy-requirements">Requirements *</label>
          <textarea id="vacancy-requirements" name="requirements" required minLength={10} defaultValue={existingJob?.requirements} />
        </div>
      </div>

      <p className="notice create-vacancy-accuracy-notice">Please check that the information you’ve entered is accurate before saving or submitting your vacancy.</p>
      {existingJob && <p className="notice">Editing updates this vacancy in place and does not submit it again. Current status: {existingJob.status}.</p>}
      {message && <p className="notice create-vacancy-success" role="status">{message}</p>}
      <div className="create-vacancy-actions">
        {existingJob ? (
          <button className="create-vacancy-save-draft" disabled={isSaving} type="submit">Save changes</button>
        ) : (
          <>
            <button className="create-vacancy-save-draft" disabled={isSaving} name="intent" type="submit" value="draft">
              Save as draft
            </button>
            <button className="secondary" disabled={isSaving} name="intent" type="submit" value="submit">
              Save &amp; submit for review
            </button>
          </>
        )}
      </div>
    </form>
  );
}
