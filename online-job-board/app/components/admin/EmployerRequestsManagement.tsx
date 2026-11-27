"use client";

import { Eye, EyeOff, FileText } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import {
  reviewEmployerRequest,
  updateBackendUserStatus,
  type EmployerRequestActionState,
} from "@/app/actions/employer-requests";

export type EmployerRequest = {
  id: string;
  userId: string;
  companyName: string;
  businessDescription: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  vatNumber?: string | null;
  registrationNumber?: string | null;
  status: string;
  rejectionReason?: string | null;
  createdAt: string;
  documentOriginalFilename?: string | null;
  documentSize?: number | null;
};

export type BackendUser = {
  id: string;
  email: string;
  role: string;
  accountStatus: string;
  createdAt: string;
};

function EmployerAccountRow({ user }: { user: BackendUser }) {
  const [state, action, pending] = useActionState<EmployerRequestActionState, FormData>(
    updateBackendUserStatus,
    {},
  );
  const active = user.accountStatus.toUpperCase() === "ACTIVE";
  return (
    <tr>
      <td>{user.email}</td>
      <td>{user.role}</td>
      <td>{user.accountStatus}</td>
      <td>
        {active && <form action={action} className="admin-employer-row-actions">
          <input name="userId" type="hidden" value={user.id} />
          <button disabled={pending} name="operation" type="submit" value="suspend">Suspend</button>
          <button
            disabled={pending}
            name="operation"
            onClick={(event) => {
              if (!window.confirm("Remove this account? This action may be difficult to reverse.")) {
                event.preventDefault();
              }
            }}
            type="submit"
            value="remove"
          >
            Remove
          </button>
        </form>}
        {state.error && <p className="employer-auth-error" role="alert">{state.error}</p>}
        {state.success && <p className="employer-auth-success" role="status">{state.success}</p>}
      </td>
    </tr>
  );
}

function EmployerRequestRow({ request }: { request: EmployerRequest }) {
  const [state, action, pending] = useActionState<EmployerRequestActionState, FormData>(
    reviewEmployerRequest,
    {},
  );
  const [documentState, setDocumentState] = useState<{ url?: string; error?: string; pending?: boolean }>({});
  const isPending = request.status.toUpperCase() === "PENDING";

  useEffect(() => {
    const url = documentState.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [documentState.url]);

  async function loadDocumentPreview() {
    setDocumentState({ pending: true });
    try {
      const response = await fetch(
        `/api/admin/employer-requests/${encodeURIComponent(request.id)}/document`,
      );
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null;
        setDocumentState({
          error: result?.error ?? "The certificate could not be loaded.",
        });
        return;
      }
      const document = await response.blob();
      if (document.type !== "application/pdf") {
        setDocumentState({ error: "The backend did not return a PDF certificate." });
        return;
      }
      setDocumentState({ url: URL.createObjectURL(document) });
    } catch {
      setDocumentState({ error: "Unable to connect to certificate storage. Check your connection and try again." });
    }
  }

  return (
    <article className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <h2>{request.companyName}</h2>
          <p>{request.contactEmail} · {request.status}</p>
        </div>
        <time dateTime={request.createdAt}>{new Date(request.createdAt).toLocaleDateString()}</time>
      </div>
      <dl className="admin-employer-details-list">
        <div><dt>Business description</dt><dd>{request.businessDescription}</dd></div>
        <div><dt>Contact phone</dt><dd>{request.contactPhone}</dd></div>
        <div><dt>Location</dt><dd>{request.location}</dd></div>
        {request.registrationNumber && <div><dt>Business registration number</dt><dd>{request.registrationNumber}</dd></div>}
        {request.vatNumber && <div><dt>VAT / tax number</dt><dd>{request.vatNumber}</dd></div>}
        <div>
          <dt>Registration certificate</dt>
          <dd>
            {request.documentOriginalFilename ? (
              <>
                <FileText aria-hidden="true" size={16} />
                <span>{request.documentOriginalFilename}</span>
                {request.documentSize && <span> ({Math.ceil(request.documentSize / 1024)} KB)</span>}
                <div>
                  <button disabled={documentState.pending} onClick={loadDocumentPreview} type="button">
                    <Eye aria-hidden="true" size={16} />
                    {documentState.pending ? "Loading certificate…" : "Preview certificate"}
                  </button>
                  {documentState.url && (
                    <button onClick={() => setDocumentState({})} type="button">
                      <EyeOff aria-hidden="true" size={16} /> Hide preview
                    </button>
                  )}
                </div>
                {documentState.url && (
                  <>
                    <iframe
                      className="admin-employer-document-preview"
                      src={documentState.url}
                      title={`Business registration certificate for ${request.companyName}`}
                    />
                    <a href={documentState.url} rel="noreferrer" target="_blank">Open certificate in a new tab</a>
                  </>
                )}
                {documentState.error && <p className="employer-auth-error" role="alert">{documentState.error}</p>}
              </>
            ) : "No registration document submitted."}
          </dd>
        </div>
        {request.rejectionReason && <div><dt>Decision reason</dt><dd>{request.rejectionReason}</dd></div>}
      </dl>
      {isPending && !state.success && (
        <form action={action} className="admin-employer-row-actions">
          <input name="requestId" type="hidden" value={request.id} />
          <label>
            <span className="sr-only">Rejection reason for {request.companyName}</span>
            <input name="reason" placeholder="Reason if rejecting" />
          </label>
          <button disabled={pending} name="decision" type="submit" value="approve">Approve</button>
          <button disabled={pending} name="decision" type="submit" value="reject">Reject</button>
          {state.error && <p className="employer-auth-error" role="alert">{state.error}</p>}
          {state.success && <p className="employer-auth-success" role="status">{state.success}</p>}
        </form>
      )}
    </article>
  );
}

export default function EmployerRequestsManagement({
  requests,
  users,
}: {
  requests: EmployerRequest[];
  users: BackendUser[];
}) {
  const employers = users.filter((user) => user.role.toUpperCase() === "EMPLOYER");
  if (requests.length === 0 && employers.length === 0) {
    return <p className="admin-panel" role="status">There are no employer approval requests.</p>;
  }

  return (
    <section aria-label="Employer approval requests" className="admin-employer-management-panel" id="employer-requests">
      {requests.map((request) => <EmployerRequestRow key={request.id} request={request} />)}
      <section aria-label="Employer accounts" className="admin-panel" id="platform-accounts">
        <div className="admin-panel-heading">
          <div><h2>Employer accounts</h2><p>Manage employer account access.</p></div>
        </div>
        <div className="admin-table-wrap" role="region" tabIndex={0}>
          <table className="admin-employer-table">
            <thead><tr><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
            <tbody>
              {employers.map((user) => <EmployerAccountRow key={user.id} user={user} />)}
              {employers.length === 0 && <tr><td colSpan={4}>No employer accounts are available.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
