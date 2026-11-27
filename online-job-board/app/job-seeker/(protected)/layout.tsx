import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutJobSeeker } from "@/app/actions/job-seeker";
import { getJobSeekerSession } from "@/lib/job-seeker-session";

export default async function JobSeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getJobSeekerSession();
  if (!user) redirect("/login");

  return (
    <main className="employer-dashboard job-seeker-workspace">
      <header className="employer-dashboard-header job-seeker-header">
        <Link className="employer-brand" href="/job-seeker/dashboard">OnlineJobBoard</Link>
        <nav aria-label="Job seeker navigation" className="employer-dashboard-nav">
          <Link href="/job-seeker/dashboard">Dashboard</Link>
          <Link href="/job-seeker/upgrade">Become an employer</Link>
        </nav>
        <div className="employer-dashboard-user">
          <span className="employer-dashboard-email">{user.email}</span>
          <form action={logoutJobSeeker}>
            <button className="employer-dashboard-signout" type="submit">Sign out</button>
          </form>
        </div>
      </header>
      <section className="employer-dashboard-main job-seeker-content">{children}</section>
    </main>
  );
}
