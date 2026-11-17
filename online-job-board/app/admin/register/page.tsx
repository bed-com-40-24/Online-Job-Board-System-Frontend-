import AdminAuthForm from "@/app/components/admin/admin-auth-form";

export default function AdminRegisterPage() {
  if (process.env.AUTH_BACKEND === "api") {
    return (
      <main className="employer-auth-page admin-auth-page">
        <section className="employer-auth-frame employer-auth-login-frame">
          <div className="employer-auth-content">
            <h1>Administrator accounts are managed by the backend</h1>
            <p className="employer-auth-lead">
              Ask the backend administrator to provision your account, then sign in here.
            </p>
          </div>
        </section>
      </main>
    );
  }
  return <AdminAuthForm mode="register" />;
}
