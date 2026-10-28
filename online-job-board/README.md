# OnlineJobBoard Authentication

Employer and administrator accounts use the local Oracle XE database. Administrator registration requires a private `ADMIN_SIGNUP_KEY`, which is shared only with authorized administrators.

## Requirements

- Node.js 20 or later
- Oracle Database XE running locally with the `XEPDB1` service open
- The `employer_app` database user and `employers` table

The `employers` table is owned by `EMPLOYER_APP` and contains `employer_id`, `email`, `password_hash`, `company_name`, and `created_at`. The administrator tables are defined in [`database/administrator-auth.sql`](./database/administrator-auth.sql); run that script as the Oracle schema owner before using administrator registration or password recovery.

## Configure the app

Create `.env.local` in the project root and copy the values from `.env.example`. Set `ORACLE_PASSWORD` to the password for the Oracle `employer_app` user. Set `SESSION_SECRET` and `ADMIN_SIGNUP_KEY` to separate random values of at least 32 characters. Generate each with:

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

Opening `/admin` takes users to `/admin/login`. Registered administrators can sign in there, and authorized administrators can follow the signup link and register at `/admin/register` using the private setup key. Users without the key cannot create administrator accounts. Administrator login is at `/admin/login`, and the protected workspace is at `/admin/dashboard`. Administrator sessions use a separate, HTTP-only cookie and are verified by the protected admin route-group layout.

Oracle credentials are read only by server-side code in `lib/oracle.ts`. Password reset requests display a clear error when the mail server cannot send the link.