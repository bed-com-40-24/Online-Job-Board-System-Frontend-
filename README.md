# Online Job Board frontend demo

A frontend-only job-board prototype built with Next.js 16 App Router, React, and TypeScript. It uses seeded sample records and browser storage to demonstrate employer and administrator workflows. It does not connect to a backend.

## Run locally

Requirements: Node.js and npm.

```powershell
npm.cmd ci
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000). Other useful commands:

```powershell
npm.cmd run lint
npm.cmd run build
```

## Demo accounts

| Workspace | Email | Password |
| --- | --- | --- |
| Employer — Lakeview Technologies | `employer@onlinejobboard.mw` | `Employer123!` |
| Administrator | `admin@onlinejobboard.mw` | `Admin123!` |

The login is a UI simulation, not authentication. Choose **Reset demo data** in the workspace header to restore the original employers, vacancies, applications, and activity. The records are shared between the demo roles in the current browser.

## Main workflows

- **Employer:** overview; search/filter owned vacancies; create or edit drafts; validate and submit or resubmit rejected vacancies; close published vacancies with confirmation; search/filter applications; inspect candidate profiles; update application statuses or reject with a reason.
- **Administrator:** overview; search employer records; activate or suspend accounts; verify or reject pending business profiles with a checklist and rejection reason; search/filter and inspect vacancy submissions; approve eligible postings or reject with a reason.
- **Both roles:** role-gated workspace routes, responsive navigation, and role-filtered activity feed. Decisions record the demo actor and timestamp.

## Requirements traceability

“Implemented” describes frontend demo behavior, not a production service. Verification performed: `npm.cmd run lint`, `npm.cmd run build`, and representative manual browser smoke tests covering both demo roles, role-gated navigation, vacancy creation/submission/approval/closure, applicant profile and status updates, employer verification and account activation, activity filtering, browser persistence, and resetting sample data. No automated unit, integration, or browser test suite is configured, so these checks are not exhaustive.

| ID | Requirement | Coverage | Verification |
| --- | --- | --- | --- |
| EFR-01 | Employer sign-in, session role, invalid-credential feedback | Demo credential form; session-scoped role | Sign-in and role gating smoke-tested |
| EFR-02 | Employer overview and owned-vacancy dashboard | Employer overview, counts, links | Dashboard and owned-vacancy navigation smoke-tested |
| EFR-03 | Create/edit drafts; required vacancy fields; future deadline; submit and resubmit | Vacancy form and lifecycle validation | Creation, required-field validation, and submission smoke-tested |
| EFR-04 | Close a published vacancy with confirmation | Employer vacancy list and confirmation | Close confirmation and reset smoke-tested |
| EFR-05 | Search applications, inspect candidate profiles, update status, reject with reason/notes | Application table, profile dialog, reason dialog | Profile inspection, status update, and persistence smoke-tested |
| AFR-01 | Administrator sign-in and role-gated routes | Demo credential form and role gate | Sign-in and role gating smoke-tested |
| AFR-02 | Employer search, account status controls, verification decision and reason | Employer directory and verification workspace | Employer filtering, verification, and account activation smoke-tested |
| AFR-03 | Vacancy search/filter/detail and approval/rejection decisions | Job review workspace and checklist | Vacancy review, approval, and rejection smoke-tested |
| AFR-04 | Activity feed with role and action filters; actor/time capture | Local activity feed and decision records | Role/action filtering and recorded activity smoke-tested |
| NFR-01 | Responsive layouts, keyboard access, labels, feedback, and empty states | Shared workspace styles and semantic controls | Navigation controls and representative route rendering smoke-tested |
| NFR-02 | Persist demo data locally and restore sample records | `localStorage`; reset action in workspace header | Browser persistence and seeded-data reset smoke-tested |
| NFR-03 | No backend or additional runtime dependencies | Seeded in-browser store; existing dependencies retained | Existing dependency stack retained; no backend connected |

## Limitations

- Credentials and authorization are demo-only client behavior and are not secure authentication or access control.
- Employers, vacancies, applications, decisions, and activity are sample data stored in the browser's `localStorage`; the selected role uses `sessionStorage`. Clearing browser storage resets records. There is no cross-browser or multi-user synchronization.
- No public job search/apply flow, employer self-registration/profile editing, document uploads, email notifications, real company-registration checks, or server-side audit log is connected.
- Employer account activation does not constitute real identity/business verification. Review checklists and seeded applicant profiles are illustrative.
- There are no automated unit, integration, or browser tests configured. `lint` and `build` do not verify interactive behavior.
