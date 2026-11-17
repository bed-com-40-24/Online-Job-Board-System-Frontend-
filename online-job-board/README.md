# OnlineJobBoard Authentication

Employer and administrator accounts use a local demo store by default so the app can be tested before a backend is ready. Set `AUTH_BACKEND=oracle` to use the Oracle backend, or `AUTH_BACKEND=api` to use the recruitment backend API for authentication and employer approval. The demo store is for single-machine testing only and is not suitable for production or multiple application instances. Local administrator registration requires a private `ADMIN_SIGNUP_KEY`; API-mode administrator accounts are provisioned by the backend team.

## Requirements

- Node.js 20 or later
- Oracle Database XE running locally with the `XEPDB1` service open
- The `employer_app` database user and `employers` table

When using Oracle, the `employers` table is owned by `EMPLOYER_APP` and contains `employer_id`, `email`, `password_hash`, `company_name`, and `created_at`. Run [`database/employer-security.sql`](./database/employer-security.sql) once as the schema owner to add employer registration details and persistent login lockouts, then run [`database/employer-certificate-upload.sql`](./database/employer-certificate-upload.sql) to add certificate-file storage. Employer registration requires a PDF or JPEG, PNG, or WebP certificate image (up to 5 MB); the file is validated on the server and stored in Oracle. The administrator tables are defined in [`database/administrator-auth.sql`](./database/administrator-auth.sql); run that script before using Oracle administrator registration or password recovery. Run [`database/employer-password-resets.sql`](./database/employer-password-resets.sql) and the password-reset table definitions in `database/administrator-auth.sql` before using Oracle password recovery.

## Configure the app

Create `.env.local` in the project root. For local testing, set `AUTH_BACKEND=demo` (or omit it; demo is the default). The demo store is written to `.data/demo-auth.json`, which is ignored by Git. Set `AUTH_BACKEND=oracle` when the Oracle database is ready, and set `ORACLE_PASSWORD` to the password for the Oracle `employer_app` user. Set `SESSION_SECRET` and `ADMIN_SIGNUP_KEY` to separate random values of at least 32 characters. Generate each with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Configure `APP_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` to enable password reset emails. Use credentials and a sender address authorized by your email provider. Restart the app after updating `.env.local`. Keep these variables server-only: do not prefix them with `NEXT_PUBLIC_` or commit `.env.local`.

The local XE connection string is `localhost:1521/XEPDB1`.

To open password-reset links on a phone as well as this computer during local development, set `APP_URL` in `.env.local` to this computer's Wi-Fi IPv4 address, for example `http://192.168.1.25:3000`. Find the address in Windows with `ipconfig` (look for the Wi-Fi adapter's IPv4 Address), and use the same Wi-Fi network on both devices. Start the app with `npm run dev -- --hostname 0.0.0.0`, and allow Node.js through Windows Firewall on private networks if prompted. The IP address can change when reconnecting to Wi-Fi; update `APP_URL` and restart the app if it does. Keep the dev server running while using the reset link.

## Run the project

```bash
npm install
npm run dev
```

## Run with Docker

Create `.env.local` in the project root and set `AUTH_BACKEND=demo`, plus separate random values for `SESSION_SECRET` and `ADMIN_SIGNUP_KEY` (at least 32 characters each; see [Configure the app](#configure-the-app) for generating them). Compose passes this file into the container; it is not copied into the image.

Build and start the app:

```bash
docker compose up --build -d
docker compose logs -f app
```

Open [http://localhost:3000](http://localhost:3000). Stop the app with `docker compose down`. Demo accounts and login data persist in the `demo_auth_data` Docker volume across restarts. `docker compose down -v` also removes that volume and its data.

To connect to an Oracle database running on the Docker host, use `host.docker.internal:1521/XEPDB1` for `ORACLE_CONNECT_STRING` in `.env.local`; the Compose service includes the host mapping for Linux.

## Recruitment backend API

The frontend can use the separate recruitment API for account sign-in and employer approval. Set `AUTH_BACKEND=api` and `BACKEND_API_URL` in `.env.local`, for example `http://localhost:8080` when the frontend runs directly on the host. Keep `BACKEND_API_URL` server-only; it must not use a `NEXT_PUBLIC_` prefix. Keep `SESSION_SECRET` configured as described above. Restart/recreate the frontend after changing environment variables.

Employer signup creates an account through the API and submits an employer access request. An administrator account must be provisioned by the backend team; administrator registration is disabled in API mode. Administrators can approve or reject requests from **Employer management**.

When running the frontend in Docker, `localhost` points to the frontend container, not the host. Set `BACKEND_API_URL` to an address reachable from that container and make sure the backend is listening on an interface/network the frontend container can access. The provided backend Compose file publishes port 8080 only on host loopback, so that default binding is not reachable from a separate container. Do not expose the backend publicly just to make local containers communicate.

The current backend API supports employer vacancy management and employer-side application review, now connected to the employer workspace. It does not expose endpoints for administrator job moderation, employer certificate review, admin activity history, or profile editing. Those unsupported screens are disabled in API mode instead of displaying demo records.

Next.js compiles pages on first visit in development, so use a production build when measuring page response times:

```bash
npm run build
npm run start
```

If development compilation is still slow on Windows, keep the project and `.next` cache on a local SSD or Windows Dev Drive rather than a network or synced folder. The Next.js development log can report slow filesystem access.

Opening `/admin` takes users to `/admin/login`. Administrators can register at `/admin/register` using the private setup key. Employer and administrator passwords are stored as bcrypt hashes in the selected backend. In demo mode, password-reset links are displayed directly in the form instead of being emailed. Administrator login is at `/admin/login`, and the protected workspace is at `/admin/dashboard`. Both workspaces require signed, HTTP-only session cookies; `SESSION_SECRET` is mandatory and there is no unsigned-session fallback.

The employer and administrator workspace headers include back and forward buttons for browser navigation. Back returns to the appropriate workspace dashboard when there is no earlier page in the browser history.

Password reset tokens are random, stored only as SHA-256 hashes, expire after one hour, and can be used once. Three consecutive incorrect sign-in attempts lock that account type and email for 60 seconds; the server enforces the lock even if the form is refreshed. Configure SMTP before requesting a reset in Oracle mode; delivery errors are surfaced in the form. Oracle credentials and the administrator setup key are read only by server-side code.

The current Oracle schema stores employer and administrator accounts. Vacancy management, employer verification status, applications, and platform activity still use separate frontend demo state and are not persisted to Oracle.