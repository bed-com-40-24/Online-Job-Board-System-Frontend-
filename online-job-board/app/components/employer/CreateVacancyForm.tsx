"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveEmployerJob, type EmployerWorkspaceActionState } from "@/app/actions/employer-workspace";
import { EMP_ID } from "@/lib/data";
import { useStore } from "@/lib/store";

type VacancyToast = {
  id: number;
  kind: "success" | "error";
  text: string;
};

export default function CreateVacancyForm({ jobId }: { jobId?: string }) {
  const router = useRouter();
  const { jobs, createEmployerJob, updateEmployerJob, backendMode } = useStore();
  const existingJob = jobs.find((job) => job.id === jobId && (backendMode || job.owner === EMP_ID));
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<VacancyToast | null>(null);
  const toastId = useRef(0);
  const [apiState, apiAction, apiPending] = useActionState<EmployerWorkspaceActionState, FormData>(
    saveEmployerJob,
    {},
  );

  useEffect(() => {
    if (apiState.redirectTo) router.replace(apiState.redirectTo);
  }, [apiState.redirectTo, router]);

  useEffect(() => {
    const text = apiState.error ?? apiState.success;
    if (!text) return;
    toastId.current += 1;
    setToast({
      id: toastId.current,
      kind: apiState.error ? "error" : "success",
      text,
    });
  }, [apiState]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      setToast((current) => current?.id === toast.id ? null : current);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function showToast(kind: VacancyToast["kind"], text: string) {
    toastId.current += 1;
    setToast({ id: toastId.current, kind, text });
  }

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
    const newJobId = existingJob
      ? null
      : createEmployerJob(job, intent === "submit" ? "In review" : "Draft");
    const saved = existingJob
      ? updateEmployerJob(existingJob.id, job)
      : Boolean(newJobId);

    if (!saved) {
      showToast("error", "The vacancy could not be saved. Please try again.");
      setIsSaving(false);
      return;
    }

    if (!existingJob && newJobId) {
      router.push(`/employer/vacancies/${encodeURIComponent(newJobId)}`);
      return;
    }

    showToast("success", "Vacancy details updated without creating another submission.");
    if (!existingJob) form.reset();
    setIsSaving(false);
  }

  return (
    <>
      {toast && (
        <div
          className={`create-vacancy-toast create-vacancy-toast-${toast.kind}`}
          role={toast.kind === "error" ? "alert" : "status"}
          aria-live={toast.kind === "error" ? "assertive" : "polite"}
          aria-atomic="true"
        >
          <span>{toast.text}</span>
          <button
            aria-label="Dismiss notification"
            className="create-vacancy-toast-dismiss"
            onClick={() => setToast(null)}
            type="button"
          >
            Dismiss
          </button>
        </div>
      )}
      <form action={backendMode ? apiAction : undefined} className="panel create-vacancy-form" onSubmit={backendMode ? undefined : handleSubmit}>
        {backendMode && jobId && <input name="jobId" type="hidden" value={jobId} />}
        <div className="formgrid">
          <div className="field">
            <label htmlFor="vacancy-title">Job title *</label>
            <input id="vacancy-title" name="title" required minLength={3} defaultValue={existingJob?.title} placeholder="Frontend Developer" />
          </div>
          {!backendMode && <div className="field">
            <label htmlFor="vacancy-department">Department *</label>
            <select id="vacancy-department" name="dept" required defaultValue={existingJob?.dept || "Engineering"}>
              {['Engineering', 'Product', 'Operations', 'Analytics', 'Human Resources', 'Finance', 'Other'].map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>}
          {!backendMode && <div className="field">
            <label htmlFor="vacancy-type">Employment type *</label>
            <select id="vacancy-type" name="type" required defaultValue={existingJob?.type || "Full-time"}>
              {['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>}
          <div className="field">
            <label htmlFor="vacancy-location">Location *</label>
            <input id="vacancy-location" name="loc" required defaultValue={existingJob?.loc} placeholder="Lilongwe, Malawi" />
          </div>
          <div className="field">
            <label htmlFor="vacancy-deadline">Application deadline *</label>
            <input id="vacancy-deadline" name="deadline" type="date" required defaultValue={existingJob?.deadline} />
          </div>
          {!backendMode && <div className="field">
            <label htmlFor="vacancy-openings">Number of openings</label>
            <input id="vacancy-openings" name="openings" type="number" min={1} defaultValue={existingJob?.openings || 1} />
          </div>}
          <div className="field wide">
            <label htmlFor="vacancy-description">Job description *</label>
            <textarea id="vacancy-description" name="description" required minLength={20} defaultValue={existingJob?.description} />
          </div>
          <div className="field wide">
            <label htmlFor="vacancy-requirements">Requirements *</label>
            <textarea id="vacancy-requirements" name="requirements" required minLength={10} defaultValue={existingJob?.requirements} />
          </div>
        </div>

        <div className="create-vacancy-actions">
          {backendMode ? (
            <button className="create-vacancy-save-draft" disabled={apiPending} type="submit">
              {apiPending ? "Saving…" : existingJob ? "Save changes" : "Publish vacancy"}
            </button>
          ) : existingJob ? (
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
    </>
  );
}
