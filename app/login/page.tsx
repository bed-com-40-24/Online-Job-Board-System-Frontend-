import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="authwrap">
      <section className="auth-card">
        <p className="eyebrow">Online Job Board</p>
        <h1>Sign in to your account</h1>
        <p className="muted">Choose the workspace that matches your account.</p>
        <div className="role-options">
          <Link className="button-link primary" href="/employer/login">
            Employer sign in
          </Link>
          <Link className="button-link secondary" href="/admin/login">
            Administrator sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
